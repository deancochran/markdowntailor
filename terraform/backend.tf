terraform {
  cloud {

    organization = "deancochran"

    workspaces {
      name = "markdowntailor-tf-backend"
    }
  }
}
