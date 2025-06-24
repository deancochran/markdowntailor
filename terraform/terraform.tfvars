# Project Configuration
project_name = "markdowntailor"
environment  = "prod"
aws_region   = "us-east-1"

# Domain Configuration
domain_name = "markdowntailor.com"

# Network Configuration
vpc_cidr = "10.0.0.0/16"
public_subnet_cidrs = [
  "10.0.1.0/24",
  "10.0.2.0/24"
]
private_subnet_cidrs = [
  "10.0.10.0/24",
  "10.0.20.0/24"
]

# Database Configuration
db_name     = "markdowntailor"
db_username = "dbadmin"
# db_password will be set via environment variable or AWS Secrets Manager

# ECS Configuration
fargate_cpu    = "512"
fargate_memory = "1024"
app_count      = 2
