terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"

    # Optional: Enable state locking
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
