# This file adds a security group rule to allow ECS tasks to access the RDS database
# It's separated from the main ECS configuration to help break circular dependencies

resource "aws_security_group_rule" "ecs_to_rds" {
  description              = "Allow ECS tasks to communicate with RDS"
  type                     = "ingress"
  from_port                = var.db_port
  to_port                  = var.db_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs_tasks.id
  security_group_id        = var.rds_security_group_id
}

# Add this variable to the ECS module's variables.tf file
variable "rds_security_group_id" {
  description = "The security group ID of the RDS instance"
  type        = string
  default     = ""
}

variable "db_port" {
  description = "The port that the RDS database is listening on"
  type        = number
  default     = 5432
}
