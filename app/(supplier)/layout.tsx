import SupplierShell from "@/components/supplier/supplier-shell"

// Authenticated dashboard — rendered on the client, not statically prerendered.
export const dynamic = "force-dynamic"

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return <SupplierShell>{children}</SupplierShell>
}
