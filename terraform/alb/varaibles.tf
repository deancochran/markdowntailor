variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The environment name"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "public_subnets" {
  description = "The list of public subnet IDs"
  type        = list(string)
}

variable "certificate_arn" {
  description = "The ARN of the SSL certificate"
  type        = string
}
