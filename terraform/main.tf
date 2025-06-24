terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  availability_zones   = data.aws_availability_zones.available.names
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# ALB Module
module "alb" {
  source = "./modules/alb"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnets
  certificate_arn = module.route53.certificate_arn

  depends_on = [module.vpc]
}

# WAF Module
module "waf" {
  source = "./modules/waf"

  project_name = var.project_name
  environment  = var.environment
  alb_arn      = module.alb.alb_arn

  depends_on = [module.alb]
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  db_name         = var.db_name
  db_username     = var.db_username
  db_password     = var.db_password

  depends_on = [module.vpc]
}

# Route53 Module
module "route53" {
  source = "./modules/route53"

  domain_name  = var.domain_name
  project_name = var.project_name
  environment  = var.environment
  alb_dns_name = module.alb.alb_dns_name
  alb_zone_id  = module.alb.alb_zone_id

  depends_on = [module.alb]
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"

  project_name             = var.project_name
  environment              = var.environment
  vpc_id                   = module.vpc.vpc_id
  private_subnets          = module.vpc.private_subnets
  alb_target_group_arn     = module.alb.target_group_arn
  alb_security_group_id    = module.alb.alb_security_group_id
  ecr_repository_url       = aws_ecr_repository.app_repo.repository_url
  image_tag                = var.image_tag
  database_url             = module.rds.db_connection_string
  next_public_base_url     = var.next_public_base_url
  auth_drizzle_url         = var.auth_drizzle_url
  auth_secret              = var.auth_secret
  auth_github_id           = var.auth_github_id
  auth_github_secret       = var.auth_github_secret
  auth_linkedin_id         = var.auth_linkedin_id
  auth_linkedin_secret     = var.auth_linkedin_secret
  auth_google_id           = var.auth_google_id
  auth_google_secret       = var.auth_google_secret
  anthropic_api_key        = var.anthropic_api_key
  upstash_redis_rest_url   = var.upstash_redis_rest_url
  upstash_redis_rest_token = var.upstash_redis_rest_token
  sentry_auth_token        = var.sentry_auth_token
  sentry_org               = var.sentry_org
  sentry_project           = var.sentry_project
  stripe_secret_key        = var.stripe_secret_key
  stripe_public_key        = var.stripe_public_key
  stripe_webhook_secret    = var.stripe_webhook_secret
  stripe_input_meter       = var.stripe_input_meter
  stripe_ouput_meter       = var.stripe_ouput_meter
  alpha_access_cutoff_date = var.alpha_access_cutoff_date

  depends_on = [module.vpc, module.alb, module.rds]
}

# ECR Repository
resource "aws_ecr_repository" "app_repo" {
  name                 = "${var.project_name}-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

}
