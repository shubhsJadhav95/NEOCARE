# RDS SG

resource "aws_security_group" "rds_sg" {
  name        = "rds-postgres-sg"
  description = "Allow Postgres access from EC2 SG and VPC CIDR"
  vpc_id      = var.vpc_id



  ingress {
    description = "Postgres from VPC CIDR"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "rds-postgres-sg"
  }
}

# RDS SUBNET

resource "aws_db_subnet_group" "default" {
  name       = "rds-postgres-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "rds-postgres-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier              = var.db_identifier
  engine                  = var.db_engine
  engine_version          = var.engine_version     #16.3
  instance_class          = var.instance_class
  allocated_storage       = var.allocated_storage
  storage_type            = var.storage_type
  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.default.name
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  publicly_accessible     = var.publicly_accessible
  skip_final_snapshot     = var.skip_final_snapshot
}