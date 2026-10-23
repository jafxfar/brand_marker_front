import { redirect } from "next/navigation"

export default function AdminVerificationRedirectPage() {
  redirect("/admin/companies?tab=verification")
}
