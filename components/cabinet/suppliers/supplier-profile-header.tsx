"use client"

import { Building2, MapPin, ShieldCheck, Globe, MessageSquare, UserPlus } from "lucide-react"
import type { CompanyWithRelations } from "@/types"
import { BuyerRating } from "@/components/supplier/rfq/buyer-rating"
import type { Category } from "@/types"

type SupplierProfileHeaderProps = {
  company: CompanyWithRelations
  categories: Category[]
  onContact: () => void
  onInvite: () => void
}

const verificationLabel = {
  verified: "Верифицирован",
  pending: "На проверке",
  rejected: "Отклонён",
} as const

export const SupplierProfileHeader = ({
  company,
  categories,
  onContact,
  onInvite,
}: SupplierProfileHeaderProps) => (
  <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Building2 size={28} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-black text-foreground">{company.title}</h1>
          {company.verification_status === "verified" && (
            <ShieldCheck size={18} className="text-primary" />
          )}
        </div>
        {company.legal_name && (
          <p className="text-sm text-muted-foreground mt-0.5">{company.legal_name}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <BuyerRating rating={company.rating} />
          <span className="text-xs text-muted-foreground">
            {company.reviews.length} отзывов
          </span>
          {(company.city || company.country) && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} />
              {[company.city, company.country].filter(Boolean).join(", ")}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {verificationLabel[company.verification_status]}
          </span>
        </div>
      </div>
    </div>

    {company.description && (
      <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{company.description}</p>
    )}

    {categories.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-4">
        {categories.map((cat) => (
          <span
            key={cat.id}
            className="text-[11px] bg-secondary text-foreground px-2.5 py-1 rounded-lg font-medium"
          >
            {cat.name}
          </span>
        ))}
      </div>
    )}

    {company.profile && (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border text-xs">
        {company.profile.founded_year && (
          <div>
            <p className="text-muted-foreground">Основан</p>
            <p className="font-semibold text-foreground mt-0.5">{company.profile.founded_year}</p>
          </div>
        )}
        {company.profile.employees_count && (
          <div>
            <p className="text-muted-foreground">Сотрудников</p>
            <p className="font-semibold text-foreground mt-0.5">{company.profile.employees_count}</p>
          </div>
        )}
        {company.stats && (
          <div>
            <p className="text-muted-foreground">Контрактов</p>
            <p className="font-semibold text-foreground mt-0.5">
              {company.stats.completed_contracts}
            </p>
          </div>
        )}
      </div>
    )}

    <div className="flex flex-wrap gap-2 mt-5">
      <button
        type="button"
        onClick={onContact}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors"
      >
        <MessageSquare size={16} /> Написать
      </button>
      <button
        type="button"
        onClick={onInvite}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors"
      >
        <UserPlus size={16} /> Пригласить к заявке
      </button>
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-primary/30 text-primary text-sm font-bold hover:bg-secondary transition-colors"
        >
          <Globe size={16} /> Сайт
        </a>
      )}
    </div>
  </div>
)
