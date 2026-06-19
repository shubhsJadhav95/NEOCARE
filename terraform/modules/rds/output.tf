output "db_instance_id" {
  description = "RDS instance identifier"
  value       = aws_db_instance.postgres.id
}

output "db_instance_arn" {
  description = "ARN of the RDS instance"
  value       = aws_db_instance.postgres.arn
}

output "db_endpoint" {
  description = "Connection endpoint (host:port)"
  value       = aws_db_instance.postgres.endpoint
}

output "db_address" {
  description = "Hostname only (no port) — useful for app config"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "Port the database listens on"
  value       = aws_db_instance.postgres.port
}

output "db_name" {
  description = "Name of the default database"
  value       = aws_db_instance.postgres.db_name
}

output "db_username" {
  description = "Master username"
  value       = aws_db_instance.postgres.username
}

output "db_security_group_id" {
  description = "Security group attached to the RDS instance"
  value       = aws_security_group.rds_sg.id
}