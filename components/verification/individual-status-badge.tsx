import { Badge } from "@/components/ui/badge"
import {
  INDIVIDUAL_STATUS_LABELS,
  type IndividualVerificationStatus,
} from "@/lib/api/client-verification"

const STATUS_VARIANT: Record<
  IndividualVerificationStatus,
  "muted" | "warning" | "safe" | "destructive"
> = {
  none: "muted",
  pending: "warning",
  needs_documents: "warning",
  verified: "safe",
  rejected: "destructive",
}

export const IndividualStatusBadge = ({
  status,
  className,
}: {
  status: IndividualVerificationStatus
  className?: string
}) => (
  <Badge variant={STATUS_VARIANT[status] ?? "muted"} className={className}>
    {INDIVIDUAL_STATUS_LABELS[status] ?? status}
  </Badge>
)
