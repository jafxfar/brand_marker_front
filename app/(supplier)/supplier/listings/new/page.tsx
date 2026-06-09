import { redirect } from "next/navigation"

export default function NewListingRedirectPage() {
  redirect("/supplier/catalog/new")
}
