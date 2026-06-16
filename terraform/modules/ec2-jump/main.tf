

# ── Security Group: allow SSH only from admin CIDR ──
resource "aws_security_group" "jump" {
  name        = "${var.project}-${var.env}-jump-sg"
  description = "Allow SSH only from trusted admin IPs"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH from admin IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project}-${var.env}-jump-sg"
  })
}

# ── Key Pair (use your existing .pem key) ──
resource "aws_key_pair" "jump" {
  key_name   = "${var.project}-${var.env}-jump-key"
  public_key = file(var.public_key_path)

  tags = var.tags
}

# ── Elastic IP so the public IP stays fixed ──
resource "aws_eip" "jump" {
  instance = aws_instance.jump.id
  domain   = "vpc"

  tags = merge(var.tags, {
    Name = "${var.project}-${var.env}-jump-eip"
  })
}

# ── Jump Server EC2 Instance ──
resource "aws_instance" "jump" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_id
  key_name                    = aws_key_pair.jump.key_name
  vpc_security_group_ids      = [aws_security_group.jump.id]
  associate_public_ip_address = true

  # Minimal bootstrap — install aws cli and session manager agent
  user_data = file("${path.module}/userdata.sh")

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  metadata_options {
    http_tokens = "required" # IMDSv2 only — security best practice
  }

  tags = merge(var.tags, {
    Name = "${var.project}-${var.env}-jump-server"
    Role = "bastion"
  })
}
