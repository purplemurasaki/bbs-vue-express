variable "name_prefix" {
  type = string
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format for OIDC trust"
  type        = string
}
