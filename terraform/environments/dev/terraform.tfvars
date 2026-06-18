

project    = "neocare"
env        = "dev"
aws_region = "us-east-1"

# Network
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]
availability_zones   = ["us-east-1a", "us-east-1b"]

# EC2
# Get latest AL2023 AMI:
# aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --region us-east-1
ami_id                = "ami-0b6d9d3d33ba97d99"   
jump_instance_type    = "c7i-flex.large"
jenkins_instance_type = "m7i-flex.large"
public_key_path       = "../../keys/neocare.pub"

# ⚠ IMPORTANT: Replace with your actual public IP (find it at https://whatismyip.com)
allowed_ssh_cidrs = ["103.167.122.21/32"]

# EKS
kubernetes_version  = "1.30"
node_instance_type  = "m7i-flex.large"
node_desired_size   = 2
node_min_size       = 2
node_max_size       = 2
eks_public_endpoint = false
