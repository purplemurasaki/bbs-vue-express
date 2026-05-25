data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_iam_role" "ec2" {
  name = "${var.name_prefix}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.name_prefix}-ec2-role"
  }
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "s3_images" {
  statement {
    sid    = "S3ImageUploadDelete"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${var.s3_bucket_arn}/*"]
  }

  statement {
    sid    = "S3ImageListBucket"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
    ]
    resources = [var.s3_bucket_arn]
  }
}

resource "aws_iam_role_policy" "s3_images" {
  name   = "${var.name_prefix}-ec2-s3"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.s3_images.json
}

data "aws_iam_policy_document" "deploy_artifacts" {
  statement {
    sid    = "DeployBucketRead"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = [
      var.deploy_bucket_arn,
      "${var.deploy_bucket_arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "deploy_artifacts" {
  name   = "${var.name_prefix}-ec2-deploy-read"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.deploy_artifacts.json
}

data "aws_iam_policy_document" "db_secret" {
  statement {
    sid    = "DbSecretRead"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    resources = [var.db_secret_arn]
  }
}

resource "aws_iam_role_policy" "db_secret" {
  name   = "${var.name_prefix}-ec2-db-secret"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.db_secret.json
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2.name
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [var.ec2_security_group_id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -euo pipefail
    dnf install -y amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
  EOF
  )

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "${var.name_prefix}-app"
  }
}
