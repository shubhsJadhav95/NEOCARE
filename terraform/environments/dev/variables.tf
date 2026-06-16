# ── General ──
variable "project" {
  description = "Project / application name"
  type        = string
}

variable "env" {
  description = "Environment (dev / staging / prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

# ── Network ──
variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b"]
}

# ── EC2 ──
variable "ami_id" {
  description = "ubuntu AMI for us-east-1"
  type        = string
  # Find latest: aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64
}

variable "jump_instance_type" {
  type    = string
  default = "c7i-flex.large"
}

variable "jenkins_instance_type" {
  type    = string
  default = "m7i-flex.large"
}

variable "public_key_path" {
  description = "Path to your SSH public key"
  type        = string
  default     = "../../keys/neocare.pub"
}

variable "allowed_ssh_cidrs" {
  description = "Your office/home IP to allow SSH to jump server"
  type        = list(string)
  # Example: ["49.xx.xx.xx/32"]
}

# ── EKS ──
variable "kubernetes_version" {
  type    = string
  default = "1.30"
}

variable "node_instance_type" {
  type    = string
  default = "m7i-flex.large"
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_min_size" {
  type    = number
  default = 1
}

variable "node_max_size" {
  type    = number
  default = 4
}

variable "eks_public_endpoint" {
  description = "Expose EKS API server publicly (false = private only)"
  type        = bool
  default     = false
}
