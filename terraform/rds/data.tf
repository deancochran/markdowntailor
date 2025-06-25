# Get the database password from Secrets Manager
data "aws_secretsmanager_secret_version" "db_password_version" {
  secret_id = aws_secretsmanager_secret.db_password.id
}

# Optional placeholder for ECS security group to break dependency cycle
# This allows the RDS module to reference an ECS security group ID that will be created later
data "aws_security_group" "ecs" {
  count = var.ecs_security_group_id != "" ? 1 : 0
  id    = var.ecs_security_group_id
}
