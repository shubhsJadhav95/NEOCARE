
resource "aws_security_group" "jenkins" {
  name        = "${var.project}-${var.env}-jenkins-sg"
  description = "SSH from jump server only; Jenkins UI from VPC"
  vpc_id      = var.vpc_id

  # SSH — only from jump server security group
  ingress {
    description     = "SSH from jump server"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [var.jump_sg_id]
  }

  # Jenkins Web UI (port 8080) — from internal VPC only
  ingress {
    description = "Jenkins UI from VPC"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  # Jenkins JNLP agent port
  ingress {
    description = "Jenkins agents JNLP"
    from_port   = 50000
    to_port     = 50000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "Allow all outbound (goes via NAT)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project}-${var.env}-jenkins-sg"
  })
}

# ── IAM Role for Jenkins (to push to ECR, describe EKS, etc.) ──
resource "aws_iam_role" "jenkins" {
  name = "${var.project}-${var.env}-jenkins-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ecr_full" {
  role       = aws_iam_role.jenkins.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}

resource "aws_iam_role_policy_attachment" "eks_worker" {
  role       = aws_iam_role.jenkins.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.jenkins.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "jenkins" {
  name = "${var.project}-${var.env}-jenkins-profile"
  role = aws_iam_role.jenkins.name
}

# ── Jenkins EC2 Instance (PRIVATE subnet, NO public IP) ──
resource "aws_instance" "jenkins" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = var.private_subnet_id
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.jenkins.id]
  iam_instance_profile        = aws_iam_instance_profile.jenkins.name
  associate_public_ip_address = false # PRIVATE — no public IP

  user_data = file("${path.module}/userdata.sh")

  root_block_device {
    volume_size           = 20   # Jenkins needs more disk for workspaces
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  metadata_options {
    http_tokens = "required"
  }

  tags = merge(var.tags, {
    Name = "${var.project}-${var.env}-jenkins"
    Role = "cicd"
  })
}
