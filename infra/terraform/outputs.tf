output "app_url" {
  description = "Application URL (EC2 public DNS, HTTP)"
  value       = module.compute.app_url
}

output "ec2_instance_id" {
  description = "EC2 instance ID for SSM Session Manager"
  value       = module.compute.instance_id
}

output "ec2_public_dns" {
  description = "EC2 public DNS name"
  value       = module.compute.public_dns
}

output "rds_endpoint" {
  description = "RDS endpoint hostname"
  value       = module.database.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS port"
  value       = module.database.port
}

output "s3_bucket_name" {
  description = "S3 bucket name for post images"
  value       = module.storage.bucket_name
}

output "cloudfront_url" {
  description = "CloudFront base URL for images (no trailing slash)"
  value       = module.storage.cloudfront_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.storage.cloudfront_distribution_id
}

output "db_secret_arn" {
  description = "Secrets Manager ARN for database credentials"
  value       = module.database.secret_arn
}
