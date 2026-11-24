resource "aws_cloudwatch_log_group" "app" {
  name = "/springstaff/app"
  retention_in_days = 14
}