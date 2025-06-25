variable "project_name" {
  description = "The name of the project"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "The environment name"
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
  sensitive   = true
}

variable "private_subnets" {
  description = "The list of private subnet IDs"
  type        = list(string)
  sensitive   = true
}

variable "ecs_security_group_id" {
  description = "The ID of the ECS security group"
  type        = string
  default     = ""
  sensitive   = true
}

variable "db_port" {
  description = "The port for the database"
  type        = number
  default     = 5432
  sensitive   = true
}

variable "allocated_storage" {
  description = "The initial allocated storage size in gigabytes"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "The maximum allocated storage size in gigabytes for autoscaling"
  type        = number
  default     = 100
}

variable "storage_type" {
  description = "The storage type for the database"
  type        = string
  default     = "gp3"
}

variable "db_engine" {
  description = "The database engine"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "The database engine version"
  type        = string
  default     = "15.4"
}

variable "db_instance_class" {
  description = "The RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "The name of the database"
  type        = string
  sensitive   = true
}

variable "db_username" {
  description = "The database administrator username."
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The password for the database administrator."
  type        = string
  sensitive   = true
}

variable "backup_retention_period" {
  description = "The number of days to retain backups."
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "The daily time range (in UTC) during which automated backups are created."
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "The weekly time range (in UTC) during which system maintenance can occur."
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "skip_final_snapshot" {
  description = "Determines whether a final DB snapshot is created before the DB instance is deleted."
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "If the DB instance should have deletion protection enabled."
  type        = bool
  default     = true
}
