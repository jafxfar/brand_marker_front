import type { RfqStatus } from "@/types"
import { rfqStatusMeta } from "@/lib/rfq-display"

type RfqStatusBadgeProps = {
  status: RfqStatus
}

export const RfqStatusBadge = ({ status }: RfqStatusBadgeProps) => {
  const meta = rfqStatusMeta[status]
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
      {meta.label}
    </span>
  )
}
