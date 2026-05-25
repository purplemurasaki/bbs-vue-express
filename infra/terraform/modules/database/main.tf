resource "random_password" "db_master" {
  length  = 32
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-mysql"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = var.rds_instance_class

  allocated_storage = var.rds_allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_master_username
  password = random_password.db_master.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period   = 7
  skip_final_snapshot       = var.rds_skip_final_snapshot
  final_snapshot_identifier = var.rds_skip_final_snapshot ? null : "${var.name_prefix}-mysql-final"

  deletion_protection = false

  tags = {
    Name = "${var.name_prefix}-mysql"
  }
}

resource "aws_secretsmanager_secret" "db" {
  name = "${var.name_prefix}/db-credentials"

  tags = {
    Name = "${var.name_prefix}-db-secret"
  }
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    database = var.db_name
    username = var.db_master_username
    password = random_password.db_master.result
  })

  depends_on = [aws_db_instance.main]
}
