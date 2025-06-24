variable "project_name" {
  description = "The name of the project"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "The environment name"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
  sensitive   = true
}

variable "private_subnets" {
  description = "The list of private subnet IDs"
  type        = list(string)
  sensitive   = true
}

variable "alb_target_group_arn" {
  description = "The ARN of the ALB target group"
  type        = string
  sensitive   = true
}

variable "alb_security_group_id" {
  description = "The ID of the ALB security group"
  type        = string
  sensitive   = true
}

variable "ecr_repository_url" {
  description = "The URL of the ECR repository"
  type        = string
  sensitive   = true
}

variable "image_tag" {
  description = "The Docker image tag"
  type        = string
  default     = "latest"
}

variable "fargate_cpu" {
  description = "The Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  type        = string
  default     = "256"
}

variable "fargate_memory" {
  description = "The Fargate instance memory to provision (in MiB)"
  type        = string
  default     = "512"
}

variable "app_count" {
  description = "The number of Docker containers to run"
  type        = number
  default     = 2
}

variable "database_url" {
  description = "The database connection string"
  type        = string
  sensitive   = true
}

variable "next_public_base_url" {
  description = "Next.js public base URL"
  type        = string
  sensitive   = true
}

variable "auth_drizzle_url" {
  description = "Drizzle Auth URL"
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

variable "stripe_input_meter" {
  description = "Stripe Input Meter"
  type        = string
  sensitive   = true
}

variable "stripe_ouput_meter" {
  description = "Stripe Output Meter"
  type        = string
  sensitive   = true
}

variable "alpha_access_cutoff_date" {
  description = "Alpha access cutoff date"
  type        = string
  sensitive   = true
}
