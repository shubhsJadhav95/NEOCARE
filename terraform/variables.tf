variable "aws_region" {
  description = "AWS region where resources will be provisioned"
  default     = "us-east-1"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  default     = "ami-05cf1e9f73fbad2e2"
}

variable "instance_type" {
  description = "Instance type for the EC2 instance"
  default     = "m7i-flex.large"
}

variable "my_enviroment" {
  description = "Instance type for the EC2 instance"
  default     = "dev"
}