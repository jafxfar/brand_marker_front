import CustomerShell from "@/components/cabinet/customer-shell"

// Authenticated dashboard — rendered on the client, not statically prerendered.
export const dynamic = "force-dynamic"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>
}
