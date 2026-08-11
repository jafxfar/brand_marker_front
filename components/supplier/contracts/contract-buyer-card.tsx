import { Building2, MapPin, ShieldCheck } from "lucide-react"
import type { CompanyWithRelations } from "@/types"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"

type ContractBuyerCardProps = {
  buyer: CompanyWithRelations | undefined
}

const verificationLabel = {
  verified: "Верифицирован",
  pending: "На проверке",
  rejected: "Отклонён",
} as const

export const ContractBuyerCard = ({ buyer }: ContractBuyerCardProps) => {
  if (!buyer) {
    return (
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Заказчик</h2>
        <p className="text-sm text-muted-foreground">Данные недоступны</p>
      </section>
    )
  }

  return (
    <section className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">Заказчик</h2>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          <Building2 size={22} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{buyer.title}</p>
          {buyer.legal_name && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{buyer.legal_name}</p>
          )}
          <div className="mt-2">
            <BuyerRating rating={buyer.rating} />
          </div>
        </div>
      </div>

      <div className="space-y-2.5 text-sm">
        {(buyer.city || buyer.country) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={14} className="flex-shrink-0" />
            <span>{[buyer.city, buyer.country].filter(Boolean).join(", ")}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck size={14} className="flex-shrink-0" />
          <span>{verificationLabel[buyer.verification_status]}</span>
        </div>
        {buyer.stats && (
          <p className="text-xs text-muted-foreground pt-1">
            {buyer.stats.completed_contracts} завершённых контрактов на платформе
          </p>
        )}
      </div>
    </section>
  )
}
