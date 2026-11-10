data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

resource "aws_key_pair" "springstaff-ec2" {
  key_name   = "springstaff-key"
  public_key = file("~/.ssh/springstaff-syd.pub")
}

resource "aws_security_group" "springstaff-sg" {
  name        = "springstaff-web"
  description = "SpringStaff web server: SSH from my IP, HTTP/HTTPS from anywhere"
  ingress {
    description = "SSH from my pc"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  ingress {
    description = "HTTP from everywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTPS from everywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "springstaff" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.springstaff-ec2.key_name
  vpc_security_group_ids = [aws_security_group.springstaff-sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  tags = {
    name = "springstaff"
  }
  root_block_device {
    volume_type = "gp3"
    volume_size = 20
  }

  metadata_options {
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  user_data = <<-EOF
    #!/bin/bash
    set -e
    apt-get update -y
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker ubuntu
  EOF

}
