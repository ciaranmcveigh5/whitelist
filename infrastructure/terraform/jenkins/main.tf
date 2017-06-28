# PROVIDER

provider "aws" {
	region = "eu-west-2"
}

# DATA

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] 
}


# VPC

resource "aws_vpc" "whitelist" {
	cidr_block = "10.0.0.0/16"

	tags {
		Name = "whitelist"
	}
}

# GATEWAYS

resource "aws_internet_gateway" "whitelist_igw" {
  vpc_id = "${aws_vpc.whitelist.id}"

  tags {
    Name = "whitelist_igw"
  }
}

resource "aws_nat_gateway" "gw" {
  allocation_id = "${aws_eip.nat_gw.id}"
  subnet_id     = "${aws_subnet.public_a.id}"
}

# IAM ROLES

resource "aws_iam_role" "test_role" {
  name = "test_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "jenkins_profile" {
  name  = "jenkins_profile"
  role = "${aws_iam_role.test_role.name}"
}

# IAM POLICIES

resource "aws_iam_policy" "jenkins" {
	name        = "jenkins_policy"
	path        = "/"
	description = "jenkins policy"

	policy = <<EOF
{
	"Version": "2012-10-17",
	"Statement": [
		{
	  		"Action": [
	    		"ec2:Describe*"
	  		],
	  		"Effect": "Allow",
	  		"Resource": "*"
		}
	]
}
EOF
}

# KEY PAIRS



# SUBNETS

resource "aws_subnet" "public_a" {
	vpc_id     = "${aws_vpc.whitelist.id}"
	cidr_block = "10.0.5.0/24"
	availability_zone = "eu-west-2a"

	tags {
		Name = "public_a"
	}
}

resource "aws_subnet" "public_b" {
	vpc_id     = "${aws_vpc.whitelist.id}"
	cidr_block = "10.0.6.0/24"
	availability_zone = "eu-west-2b"


	tags {
		Name = "public_b"
	}
}

resource "aws_subnet" "private_a" {
	vpc_id     = "${aws_vpc.whitelist.id}"
	cidr_block = "10.0.3.0/24"
	availability_zone = "eu-west-2a"


	tags {
		Name = "private_a"
	}
}

resource "aws_subnet" "private_b" {
	vpc_id     = "${aws_vpc.whitelist.id}"
	cidr_block = "10.0.4.0/24"
	availability_zone = "eu-west-2b"


	tags {
		Name = "private_b"
	}
}

# ELBS

resource "aws_elb" "whitelist" {
	name               = "whiteliste-elb"
	security_groups = ["${aws_security_group.whitelist_elb.id}"]
	subnets = ["${aws_subnet.public_a.id}"]

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

resource "aws_elb" "jenkins" {
	name               = "jenkins-elb"
	security_groups = ["${aws_security_group.whitelist_elb.id}"]
	subnets = ["${aws_subnet.public_a.id}"]

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

	instances                   = ["${aws_instance.jenkins.id}"]
	cross_zone_load_balancing   = true
	idle_timeout                = 400
	connection_draining         = true
	connection_draining_timeout = 400

	tags {
		Name = "jenkins_elb"
	}
}

# SECURITY GROUPS

resource "aws_security_group" "whitelist_elb" {
	vpc_id     = "${aws_vpc.whitelist.id}"
	name        = "whitelist_elb"
	description = "elb security group"

	ingress {
		from_port   = 80
		to_port     = 80
		protocol    = "tcp"
		cidr_blocks = ["0.0.0.0/0"]
	}

}

resource "aws_security_group" "whitelist_base" {
	vpc_id     = "${aws_vpc.whitelist.id}"
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

resource "aws_eip" "whitelist" {
	instance = "${aws_instance.whitelist.id}"
	vpc      = true
}

resource "aws_eip" "jenkins" {
	instance = "${aws_instance.jenkins.id}"
	vpc      = true
}

resource "aws_eip" "nat_gw" {
	vpc      = true
}

# INSTANCES

resource "aws_instance" "jenkins" {
	ami = "${data.aws_ami.ubuntu.id}"
	instance_type = "t2.micro"
	security_groups = ["${aws_security_group.whitelist_base.id}"]
	subnet_id = "${aws_subnet.public_a.id}"
	iam_instance_profile = "${aws_iam_instance_profile.jenkins_profile.name}"

	tags {
		Name = "jenkins"
	}
}

resource "aws_instance" "whitelist" {
	# count = 3
	ami = "${data.aws_ami.ubuntu.id}"
	instance_type = "t2.micro"
	security_groups = ["${aws_security_group.whitelist_base.id}"]
	subnet_id = "${aws_subnet.public_a.id}"

	tags {
		# Name = "whitelist_${count.index}"
		Name = "whitelist"
	}
}



