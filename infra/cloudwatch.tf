resource "aws_cloudwatch_metric_alarm" "instance_check" {
  alarm_name          = "springstaff-instance-status-check"
  alarm_description   = "The OS stopped responding (e.g. out of memory). Reboots automatically."
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed_Instance"
  dimensions          = { InstanceId = aws_instance.springstaff.id }
  statistic           = "Maximum"
  period              = 60          # seconds per data point
  evaluation_periods  = 3           # 3 bad minutes in a row
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  alarm_actions = [
    aws_sns_topic.alerts.arn,
    "arn:aws:automate:${var.region}:ec2:reboot",   # built-in action: reboot the instance
  ]
  ok_actions = [aws_sns_topic.alerts.arn]           # also email when it recovers
}

resource "aws_cloudwatch_metric_alarm" "high-cpu" {
    alarm_name = "springstaff-high-cpu" 
    alarm_description = "CPU above 80% for 15 minutes. Sends an email alert"
    dimensions = { InstanceId = aws_instance.springstaff.id}
    namespace = "AWS/EC2"
    metric_name = "CPUUtilization"
    statistic = "Average"
    period = 300
    evaluation_periods = 3
    threshold = 80
    comparison_operator = "GreaterThanThreshold"
    alarm_actions = [
        aws_sns_topic.alerts.arn
    ]
    ok_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "cpu-credit-balance" {
  alarm_name = "springstaff-low-credit-balance"
  alarm_description = "yea"
  dimensions = { InstanceId = aws_instance.springstaff.id}
  namespace = "AWS/EC2"
  metric_name = "CPUCreditBalance"
  statistic = "Minimum"
  period = 300
  threshold = 20
  comparison_operator = "LessThanThreshold"
  evaluation_periods = 2
      alarm_actions = [
        aws_sns_topic.alerts.arn
    ]
    ok_actions = [aws_sns_topic.alerts.arn]
}