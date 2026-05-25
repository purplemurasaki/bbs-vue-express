variable "name_prefix" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "public_subnet_id" {
  type = string
}

variable "ec2_security_group_id" {
  type = string
}

variable "s3_bucket_arn" {
  type = string
}

variable "deploy_bucket_arn" {
  description = "S3 ARN for CD release artifacts"
  type        = string
}

variable "db_secret_arn" {
  description = "Secrets Manager ARN for RDS credentials"
  type        = string
}
