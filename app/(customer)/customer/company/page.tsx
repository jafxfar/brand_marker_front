"use client"

import { CompanyListPage } from "@/components/company/company-list-page"

export default function CustomerCompanyPage() {
  return (
    <CompanyListPage
      actorType="buyer"
      basePath="/customer/company"
      roleLabel="Заказчик"
    />
  )
}
