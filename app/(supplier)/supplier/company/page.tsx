"use client"

import { CompanyListPage } from "@/components/company/company-list-page"

export default function SupplierCompanyPage() {
  return (
    <CompanyListPage
      actorType="supplier"
      basePath="/supplier/company"
      roleLabel="Исполнитель"
    />
  )
}
