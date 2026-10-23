import { redirect } from "next/navigation"

export default function AdminProposalsRedirectPage() {
  redirect("/admin/moderation?tab=proposals")
}
