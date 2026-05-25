variable "name_prefix" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_master_username" {
  type = string
}

variable "rds_instance_class" {
  type = string
}

variable "rds_allocated_storage" {
  type = number
}

variable "rds_skip_final_snapshot" {
  type = bool
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "rds_security_group_id" {
  type = string
}
