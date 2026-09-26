import type { RfqStatus } from "@/types"
import { rfqStatusMeta } from "@/lib/rfq-display"
import { StatusBadge } from "@/components/ui/status-badge"

type RfqStatusBadgeProps = {
  status: RfqStatus
}

export const RfqStatusBadge = ({ status }: RfqStatusBadgeProps) => {
  const meta = rfqStatusMeta[status]
  return <StatusBadge label={meta.label} className={meta.className} />
}
