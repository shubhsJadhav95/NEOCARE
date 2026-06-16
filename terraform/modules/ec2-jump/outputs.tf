output "jump_public_ip" {
  description = "Elastic IP of the jump server — use this to SSH in"
  value       = aws_eip.jump.public_ip
}

output "jump_instance_id" {
  description = "EC2 instance ID of the jump server"
  value       = aws_instance.jump.id
}

output "jump_sg_id" {
  description = "Security group ID of the jump server"
  value       = aws_security_group.jump.id
}

output "ssh_command" {
  description = "Ready-to-use SSH command to connect to the jump server"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.jump.public_ip}"
}
