variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "markdowntailor"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
  sensitive   = true
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
  sensitive   = true
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "db_name" {
  description = "Database name"
  type        = string
  sensitive   = true
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "next_public_base_url" {
  description = "Next.js public base URL"
  type        = string
  sensitive   = true
}

variable "auth_secret" {
  description = "Auth secret"
  type        = string
  sensitive   = true
}


variable "auth_github_id" {
  description = "GitHub Auth ID"
  type        = string
  sensitive   = true
}

variable "auth_github_secret" {
  description = "GitHub Auth Secret"
  type        = string
  sensitive   = true
}

variable "auth_linkedin_id" {
  description = "LinkedIn Auth ID"
  type        = string
  sensitive   = true
}

variable "auth_linkedin_secret" {
  description = "LinkedIn Auth Secret"
  type        = string
  sensitive   = true
}

variable "auth_google_id" {
  description = "Google Auth ID"
  type        = string
  sensitive   = true
}

variable "auth_google_secret" {
  description = "Google Auth Secret"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API Key"
  type        = string
  sensitive   = true
}

variable "upstash_redis_rest_url" {
  description = "Upstash Redis REST URL"
  type        = string
  sensitive   = true
}

variable "upstash_redis_rest_token" {
  description = "Upstash Redis REST Token"
  type        = string
  sensitive   = true
}

variable "sentry_auth_token" {
  description = "Sentry Auth Token"
  type        = string
  sensitive   = true
}

variable "sentry_org" {
  description = "Sentry Organization"
  type        = string
  sensitive   = true
}

variable "sentry_project" {
  description = "Sentry Project"
  type        = string
  sensitive   = true
}

variable "sentry_dns" {
  description = "Sentry DNS"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe Secret Key"
  type        = string
  sensitive   = true
}

variable "stripe_public_key" {
  description = "Stripe Public Key"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe Webhook Secret"
  type        = string
  sensitive   = true
}

variable "stripe_alpha_price_id" {
  description = "Stripe Alpha Price ID"
  type        = string
  sensitive   = true
}

variable "alpha_access_cutoff_date" {
  description = "Alpha access cutoff date"
  type        = string
  sensitive   = true
}
