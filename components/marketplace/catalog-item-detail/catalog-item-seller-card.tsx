import Link from "next/link"
import { BadgeCheck, MapPin, Star } from "lucide-react"
import type { PublicSupplier } from "@/types"
import { performerUrl } from "@/lib/marketplace-routes"

type CatalogItemSellerCardProps = {
  supplier: PublicSupplier
}

export const CatalogItemSellerCard = ({
  supplier,
}: CatalogItemSellerCardProps) => {
  const verified = supplier.verification_status === "verified"
  const location = [supplier.city, supplier.country].filter(Boolean).join(", ")

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Поставщик
          </p>
          <Link
            href={performerUrl(supplier.actor_id)}
            className="mt-1 inline-flex items-center gap-1.5 text-base font-bold text-foreground hover:text-primary"
          >
            <span className="truncate">{supplier.display_name}</span>
            {verified && (
              <BadgeCheck size={18} className="shrink-0 text-primary" aria-label="Проверен" />
            )}
          </Link>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} aria-hidden="true" />
              {location}
            </p>
          )}
        </div>
        <Link
          href={performerUrl(supplier.actor_id)}
          className="shrink-0 text-sm font-semibold text-primary hover:underline"
        >
          Профиль
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            {supplier.rating.toFixed(1)}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {supplier.reviews_count} отзывов
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-sm font-semibold capitalize">{supplier.trust_level || "—"}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Уровень доверия</p>
        </div>
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-sm font-semibold">{supplier.active_catalog_count}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Позиций в каталоге</p>
        </div>
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-sm font-semibold">
            {supplier.success_rate != null
              ? `${Math.round(supplier.success_rate)}%`
              : "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Успешные сделки</p>
        </div>
      </div>
    </section>
  )
}
