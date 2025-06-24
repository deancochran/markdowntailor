variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The environment name"
  type        = string
}

variable "alb_dns_name" {
  description = "The DNS name of the ALB"
  type        = string
  sensitive   = true
}

variable "alb_zone_id" {
  description = "The Zone ID of the ALB"
  type        = string
  sensitive   = true
}
