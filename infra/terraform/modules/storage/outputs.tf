output "bucket_name" {
  value = aws_s3_bucket.images.id
}

output "bucket_arn" {
  value = aws_s3_bucket.images.arn
}

output "cloudfront_url" {
  description = "CloudFront base URL without trailing slash"
  value       = "https://${aws_cloudfront_distribution.images.domain_name}"
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.images.id
}
