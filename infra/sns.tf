resource "aws_sns_topic" "alerts" {
  name = "springstaff-alerts"
}

resource "aws_sns_topic_subscription" "topic_subscription" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}