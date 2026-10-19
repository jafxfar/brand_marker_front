import Link from "next/link"
import { BadgeCheck, Flag, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PublicSupplier } from "@/types"
import { createRfqHref } from "@/lib/create-rfq-href"
import { loginRedirect, performerUrl } from "@/lib/marketplace-routes"

type CatalogItemBuyCardProps = {
  itemId: number
  supplier: PublicSupplier
  isAuthenticated: boolean
  canReport: boolean
  onReport: () => void
}

export const CatalogItemBuyCard = ({
  itemId,
  supplier,
  isAuthenticated,
  canReport,
  onReport,
}: CatalogItemBuyCardProps) => {
  const verified = supplier.verification_status === "verified"
  const rfqHref = createRfqHref({
    service: itemId,
    supplierId: supplier.actor_id,
  })

  return (
    <aside className="rounded-xl border border-border bg-card p-5 sm:sticky sm:top-24">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Поставщик</p>
          <Link
            href={performerUrl(supplier.actor_id)}
            className="mt-0.5 inline-flex max-w-full items-center gap-1 font-semibold text-foreground hover:text-primary"
          >
            <span className="truncate">{supplier.display_name}</span>
            {verified && (
              <BadgeCheck size={16} className="shrink-0 text-primary" aria-hidden="true" />
            )}
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
          <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
          {supplier.rating.toFixed(1)}
          <span className="font-normal text-muted-foreground">
            ({supplier.reviews_count})
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-primary" aria-hidden="true" />
          Безопасные сделки на платформе
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-primary" aria-hidden="true" />
          Контракт и оплата в одном кабинете
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <Button asChild className="h-11 w-full rounded-xl text-sm font-bold">
          <Link href={rfqHref}>Запросить предложение</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 w-full rounded-xl text-sm font-semibold">
          <Link href={performerUrl(supplier.actor_id)}>Профиль поставщика</Link>
        </Button>
        {canReport &&
          (isAuthenticated ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full text-muted-foreground"
              onClick={onReport}
              aria-label="Пожаловаться на позицию"
            >
              <Flag aria-hidden="true" />
              Пожаловаться
            </Button>
          ) : (
            <Button asChild variant="ghost" className="h-10 w-full text-muted-foreground">
              <Link href={loginRedirect(`/services/${itemId}`)}>
                <Flag aria-hidden="true" />
                Пожаловаться
              </Link>
            </Button>
          ))}
      </div>
    </aside>
  )
}
