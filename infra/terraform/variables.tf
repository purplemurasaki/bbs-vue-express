variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "bbs"
}

variable "environment" {
  description = "Environment name (e.g. dev, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "MySQL database name"
  type        = string
  default     = "bbs"
}

variable "db_master_username" {
  description = "RDS master username (used by the application)"
  type        = string
  default     = "bbs_app"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "rds_skip_final_snapshot" {
  description = "Skip final snapshot on RDS destroy (set false for production)"
  type        = bool
  default     = true
}

variable "github_repository" {
  description = "GitHub repository (owner/repo) for Actions OIDC deploy role trust"
  type        = string
  default     = "purplemurasaki/bbs-vue-express"
}
