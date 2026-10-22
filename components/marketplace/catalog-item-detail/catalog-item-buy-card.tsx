"use client"

import { useState } from "react"
import Link from "next/link"
import { BadgeCheck, Flag, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ItemPricing, PublicSupplier } from "@/types"
import { loginRedirect, performerUrl } from "@/lib/marketplace-routes"
import { resolveListPrice } from "@/lib/item-display"
import {
  CatalogBuyOfferDialog,
  CatalogNegotiateOfferDialog,
} from "@/components/marketplace/catalog-item-detail/catalog-item-offer-dialogs"

type CatalogItemBuyCardProps = {
  itemId: number
  itemTitle: string
  pricing: ItemPricing | null
  supplier: PublicSupplier
  isAuthenticated: boolean
  canUseApiOffers: boolean
  canReport: boolean
  onReport: () => void
}

export const CatalogItemBuyCard = ({
  itemId,
  itemTitle,
  pricing,
  supplier,
  isAuthenticated,
  canUseApiOffers,
  canReport,
  onReport,
}: CatalogItemBuyCardProps) => {
  const verified = supplier.verification_status === "verified"
  const listPrice = resolveListPrice(pricing)
  const [buyOpen, setBuyOpen] = useState(false)
  const [negotiateOpen, setNegotiateOpen] = useState(false)

  const loginHref = loginRedirect(`/services/${itemId}`)

  const handleBuy = () => {
    if (!isAuthenticated) return
    if (!listPrice) return
    setBuyOpen(true)
  }

  const handleNegotiate = () => {
    if (!isAuthenticated) return
    setNegotiateOpen(true)
  }

  return (
    <aside className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] lg:sticky lg:top-[88px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12.5px] text-mute">Поставщик</p>
          <Link
            href={performerUrl(supplier.actor_id)}
            className="mt-0.5 inline-flex max-w-full items-center gap-1 font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
          >
            <span className="truncate">{supplier.display_name}</span>
            {verified && (
              <BadgeCheck size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
            )}
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
          <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
          {supplier.rating.toFixed(1)}
          <span className="font-normal text-mute">
            ({supplier.reviews_count})
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-brand-50/60 p-3 text-[13px] text-ink/80">
        <div className="flex items-center gap-2 font-semibold text-brand-700">
          <ShieldCheck size={16} aria-hidden="true" />
          Покупка под защитой
        </div>
        <p className="text-mute">
          Оплата удерживается банком‑партнёром до вашей приёмки.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {canUseApiOffers ? (
          <>
            {isAuthenticated ? (
              <Button
                type="button"
                className="w-full"
                disabled={!listPrice}
                onClick={handleBuy}
              >
                Купить с гарантией
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href={loginHref}>Купить с гарантией</Link>
              </Button>
            )}
            {isAuthenticated ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleNegotiate}
              >
                Торговаться
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href={loginHref}>Торговаться</Link>
              </Button>
            )}
            {!listPrice && isAuthenticated && (
              <p className="text-center text-[12px] text-mute">
                Опубликованной цены нет — доступен только торг.
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-[12px] text-mute">
            Запросы доступны при подключении API.
          </p>
        )}
        <Button asChild variant="ghost" className="w-full">
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
              <Link href={loginHref}>
                <Flag aria-hidden="true" />
                Пожаловаться
              </Link>
            </Button>
          ))}
      </div>

      {canUseApiOffers && listPrice && (
        <CatalogBuyOfferDialog
          open={buyOpen}
          onOpenChange={setBuyOpen}
          itemId={itemId}
          itemTitle={itemTitle}
          price={listPrice.price}
          currency={listPrice.currency}
        />
      )}
      {canUseApiOffers && (
        <CatalogNegotiateOfferDialog
          open={negotiateOpen}
          onOpenChange={setNegotiateOpen}
          itemId={itemId}
          itemTitle={itemTitle}
          listPrice={listPrice?.price ?? null}
          currency={listPrice?.currency ?? pricing?.currency ?? "TJS"}
        />
      )}
    </aside>
  )
}
