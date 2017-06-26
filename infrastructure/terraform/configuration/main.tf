# PROVIDER

provider "aws" {
	region = "eu-west-2"
}

# DATA




# VPC

resource "aws_vpc" "whitelist" {
	cidr_block = "10.0.0.0/16"

	tags {
		Name = "whitelist"
	}
}

# IAM ROLES

# IAM POLICIES

# SUBNETS

resource "aws_subnet" "public" {
	vpc_id     = "${aws_vpc.whitelist.id}"
	cidr_block = "10.0.1.0/24"

	tags {
		Name = "public"
	}
}

resource "aws_subnet" "private" {
	vpc_id     = "${aws_vpc.whitelist.id}"
	cidr_block = "10.0.2.0/24"

	tags {
		Name = "private"
	}
}

# ELBS

resource "aws_elb" "whitelist" {
	name               = "whiteliste_elb"
	availability_zones = ["eu-west-2a", "eu-west-2b"]

	listener {
		instance_port     = 8000
		instance_protocol = "http"
		lb_port           = 80
		lb_protocol       = "http"
	}

	health_check {
		healthy_threshold   = 2
		unhealthy_threshold = 2
		timeout             = 3
		target              = "HTTP:8000/"
		interval            = 30
	}

	instances                   = ["${aws_instance.whitelist.id}"]
	cross_zone_load_balancing   = true
	idle_timeout                = 400
	connection_draining         = true
	connection_draining_timeout = 400

	tags {
		Name = "whiteliste_elb"
	}
}

# SECURITY GROUPS

resource "aws_security_group" "whitelist_base" {
	name        = "whitelist_base"
	description = "Base security group"

	ingress {
		from_port   = 22
		to_port     = 22
		protocol    = "tcp"
		cidr_blocks = ["170.194.32.0/24"]
	}

	ingress {
		from_port   = 80
		to_port     = 80
		protocol    = "tcp"
		cidr_blocks = ["0.0.0.0/0"]
	}

	egress {
		from_port       = 80
		to_port         = 80
		protocol        = "tcp"
		cidr_blocks     = ["0.0.0.0/0"]
	}
}

# EIP

resource "aws_eip" "lb" {
	instance = "${aws_instance.whitelist.id}"
	vpc      = true
}

# INSTANCES

resource "aws_instance" "whitelist" {
	count = 3
	ami = "ami-7d50491b"
	instance_type = "t2.micro"
	security_groups = ["${aws_security_group.whitelist_base.id}"]
	subnet_id = ${aws_subnet.public.id}

	tags {
		Name = "whitelist_${count.index}"
	}
}

