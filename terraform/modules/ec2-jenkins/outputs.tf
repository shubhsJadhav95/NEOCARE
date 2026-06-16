output "jenkins_private_ip" {
  description = "Private IP of Jenkins server (access via jump server)"
  value       = aws_instance.jenkins.private_ip
}

output "jenkins_instance_id" {
  description = "EC2 instance ID of Jenkins"
  value       = aws_instance.jenkins.id
}

output "jenkins_sg_id" {
  description = "Security group ID of Jenkins"
  value       = aws_security_group.jenkins.id
}

output "ssh_via_jump" {
  description = "SSH command: first SSH into jump, then hop to Jenkins"
  value       = "ssh -J ubuntu@<JUMP_PUBLIC_IP> ubuntu@${aws_instance.jenkins.private_ip}"
}

output "jenkins_url" {
  description = "Jenkins UI URL (accessible inside VPC)"
  value       = "http://${aws_instance.jenkins.private_ip}:8080"
}
