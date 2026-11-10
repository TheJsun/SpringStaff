resource "aws_s3_bucket" "files" {
  bucket = var.files_bucket_name
}

resource "aws_s3_bucket" "backups" {
  bucket = var.backups_bucket_name
}

resource "aws_s3_bucket_public_access_block" "files" {
  bucket                  = aws_s3_bucket.files.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "files" {
  bucket = aws_s3_bucket.files.id

  cors_rule {
    allowed_origins = [
      "https://springstaff.duckdns.org",
      "http://localhost:5173",
    ]
    allowed_methods = ["PUT", "GET"]
    allowed_headers = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id = "expire-old-backups"

    filter {

    }

    expiration {
      days = 30
    }
    status = "Enabled"
  }

}