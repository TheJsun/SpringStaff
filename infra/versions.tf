terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.0" }
  }
  backend "s3" {
    bucket       = "springstaff-tfstate-jj"
    key          = "prod/terraform.tfstate"
    region       = "ap-southeast-2"
    profile      = "springstaff"
    use_lockfile = true
  }
}

provider "aws" {
  region  = var.region
  profile = "springstaff"
  default_tags { tags = { Project = "springstaff", ManagedBy = "terraform" } }
}