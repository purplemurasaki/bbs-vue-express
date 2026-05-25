locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

module "network" {
  source = "./modules/network"

  name_prefix = local.name_prefix
  vpc_cidr    = var.vpc_cidr
}

module "security" {
  source = "./modules/security"

  name_prefix = local.name_prefix
  vpc_id      = module.network.vpc_id
}

module "storage" {
  source = "./modules/storage"

  name_prefix = local.name_prefix
}

module "database" {
  source = "./modules/database"

  name_prefix             = local.name_prefix
  db_name                 = var.db_name
  db_master_username      = var.db_master_username
  rds_instance_class      = var.rds_instance_class
  rds_allocated_storage   = var.rds_allocated_storage
  rds_skip_final_snapshot = var.rds_skip_final_snapshot
  private_subnet_ids      = module.network.private_subnet_ids
  rds_security_group_id   = module.security.rds_security_group_id
}

module "compute" {
  source = "./modules/compute"

  name_prefix           = local.name_prefix
  instance_type         = var.ec2_instance_type
  public_subnet_id      = module.network.public_subnet_id
  ec2_security_group_id = module.security.ec2_security_group_id
  s3_bucket_arn         = module.storage.bucket_arn
}
