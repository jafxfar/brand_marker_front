import { Badge } from "@/components/ui/badge"
import type {
  AdminCompanyOperationalStatus,
  AdminCompanyVerificationStatus,
} from "@/lib/api/admin"
import { cn } from "@/lib/utils"

const verificationMetadata: Record<
  AdminCompanyVerificationStatus,
  { label: string; className: string }
> = {
  verified: {
    label: "Верифицирована",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  pending: {
    label: "Ожидает проверки",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  needs_documents: {
    label: "Нужны документы",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  rejected: {
    label: "Отклонена",
    className: "border-red-200 bg-red-50 text-red-700",
  },
}

const operationalMetadata: Record<
  AdminCompanyOperationalStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Активна",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  blocked: {
    label: "Заблокирована",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  deactivated: {
    label: "Деактивирована",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
}

export const CompanyVerificationBadge = ({
  status,
  className,
}: {
  status: AdminCompanyVerificationStatus
  className?: string
}) => {
  const metadata = verificationMetadata[status]
  return (
    <Badge variant="outline" className={cn(metadata.className, className)}>
      {metadata.label}
    </Badge>
  )
}

export const CompanyOperationalBadge = ({
  status,
  className,
}: {
  status: AdminCompanyOperationalStatus
  className?: string
}) => {
  const metadata = operationalMetadata[status]
  return (
    <Badge variant="outline" className={cn(metadata.className, className)}>
      {metadata.label}
    </Badge>
  )
}
