import { redirect } from "next/navigation"

export default function AdminContractsRedirectPage() {
  redirect("/admin/disputes?tab=contracts")
}
