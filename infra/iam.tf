data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "springstaff-ec2-role" {
  name               = "springstaff-ec2-role-tf"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

resource "aws_iam_role_policy" "springstaff-iam-role-policy" {
  name = "springstaff-policy"
  role = aws_iam_role.springstaff-ec2-role.id

  policy = jsonencode({
    "Version" = "2012-10-17",
    "Statement" = [
      {
        "Effect" = "Allow",
        "Action" = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ],
        "Resource" = "${aws_s3_bucket.files.arn}/*"
      },
      {
        "Effect" = "Allow",
        "Action" = [
          "s3:PutObject",
          "s3:GetObject"
        ],
        "Resource" = "${aws_s3_bucket.backups.arn}/*"
      },
      {
        "Effect"   = "Allow",
        "Action"   = "s3:ListBucket",
        "Resource" = "${aws_s3_bucket.backups.arn}"
      },
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "springstaff-ec2-profile-tf"
  role = aws_iam_role.springstaff-ec2-role.id
}