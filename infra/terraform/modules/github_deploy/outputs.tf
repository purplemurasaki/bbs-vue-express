output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}

output "deploy_bucket_name" {
  value = aws_s3_bucket.deploy.bucket
}

output "deploy_bucket_arn" {
  value = aws_s3_bucket.deploy.arn
}
