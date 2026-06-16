terraform {
  backend "s3" {
    bucket       = "shubhsjadhav95-terraform-s3"
    key          = "backend-locking"
    region       = "us-east-1"
    use_lockfile = true
  }
}