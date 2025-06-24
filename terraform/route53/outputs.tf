output "certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate_validation.main.certificate_arn
}

output "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  value       = data.aws_route53_zone.main.zone_id
}
