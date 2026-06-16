variable "project"          { type = string }
variable "env"              { type = string }
variable "vpc_id"           { type = string }
variable "public_subnet_id" { type = string }

variable "ami_id" {
  description = "AMI ID — use Amazon Linux 2023 for your region"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the jump server"
  type        = string
  default     = "t3.micro"
}

variable "public_key_path" {
  description = "Path to your SSH public key file (.pub)"
  type        = string
  default     = "../../keys/neocare.pub"
}

variable "allowed_ssh_cidrs" {
  description = "CIDR list of IPs allowed to SSH into the jump server"
  type        = list(string)
}

variable "tags" {
  type    = map(string)
  default = {}
}
