resource "aws_sns_topic" "sns_topic" {
  name = "springstaff-alerts"
}

resource "aws_sns_topic_subscription" "topic_subscription" {
  topic_arn = aws_sns_topic.sns_topic.arn
  protocol  = "email"
  endpoint  = var.alert_email
}