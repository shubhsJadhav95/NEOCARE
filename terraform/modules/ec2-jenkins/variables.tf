variable "project"           { type = string }
variable "env"               { type = string }
variable "vpc_id"            { type = string }
variable "vpc_cidr"          { type = string }
variable "private_subnet_id" { type = string }
variable "jump_sg_id"        { type = string }
variable "key_name"          { type = string }

variable "ami_id" {
  description = "AMI ID — Amazon Linux 2023"
  type        = string
}

variable "instance_type" {
  description = "Instance type for Jenkins (m7i-flex.large minimum recommended)"
  type        = string
  default     = "m7i-flex.large"
}

variable "tags" {
  type    = map(string)
  default = {}
}
