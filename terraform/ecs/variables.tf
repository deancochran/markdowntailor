variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The environment name"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "private_subnets" {
  description = "The list of private subnet IDs"
  type        = list(string)
}

variable "alb_target_group_arn" {
  description = "The ARN of the ALB target group"
  type        = string
}

variable "alb_security_group_id" {
  description = "The ID of the ALB security group"
  type        = string
}

variable "ecr_repository_url" {
  description = "The URL of the ECR repository"
  type        = string
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

variable "db_host" {
  description = "The database host"
  type        = string
}

variable "db_name" {
  description = "The database name"
  type        = string
}

variable "db_username" {
  description = "The database username"
  type        = string
}

variable "db_password" {
  description = "The database password"
  type        = string
  sensitive   = true
}
