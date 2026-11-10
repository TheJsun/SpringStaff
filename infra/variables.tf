variable "region" {
  description = "the AWS region your resources will be deployed to"
  type        = string
  default     = "ap-southeast-2"
}

variable "my_ip" {
  type        = string
  description = "ip address of host device"
}

variable "files_bucket_name" {
  type        = string
  description = "S3 bucket for employee documents"
}

variable "backups_bucket_name" {
  type        = string
  description = "S3 bucket for nightly database backups"
}

variable "instance_type" {
  description = "the size of the EC2 instance"
  type        = string
  default     = "t3.micro"
}