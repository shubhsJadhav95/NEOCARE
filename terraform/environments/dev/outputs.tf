# ── VPC Outputs ──
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

# ── Jump Server Outputs ──
output "jump_public_ip" {
  description = "SSH to this IP to enter the network"
  value       = module.jump_server.jump_public_ip
}

output "jump_ssh_command" {
  description = "Run this to SSH into the jump server"
  value       = module.jump_server.ssh_command
}

# ── Jenkins Outputs ──
output "jenkins_private_ip" {
  description = "Jenkins private IP (only reachable via jump server)"
  value       = module.jenkins.jenkins_private_ip
}

output "jenkins_ssh_via_jump" {
  description = "ProxyJump SSH command to reach Jenkins"
  value       = "ssh -J ubuntu@${module.jump_server.jump_public_ip} ubuntu@${module.jenkins.jenkins_private_ip}"
}

output "jenkins_ui_tunnel" {
  description = "SSH tunnel command to access Jenkins UI in browser"
  value       = "ssh -L 8080:${module.jenkins.jenkins_private_ip}:8080 ubuntu@${module.jump_server.jump_public_ip}"
}

# ── EKS Outputs ──
output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_kubeconfig_command" {
  description = "Run this on jump/jenkins server to configure kubectl"
  value       = module.eks.kubeconfig_command
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN for IRSA (IAM Roles for Service Accounts)"
  value       = module.eks.oidc_provider_arn
}

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