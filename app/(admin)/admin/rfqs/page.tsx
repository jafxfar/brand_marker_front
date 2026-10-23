import { redirect } from "next/navigation"

export default function AdminRfqsRedirectPage() {
  redirect("/admin/moderation?tab=rfqs")
}
