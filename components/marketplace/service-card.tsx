"use client"

import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import type { MarketplaceService } from "@/types/marketplace"
import { getIcon } from "@/lib/icon-map"
import { serviceUrl } from "@/lib/marketplace-routes"
import { VerifiedChip } from "@/components/bm"

type ServiceCardProps = {
  service: MarketplaceService
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const Icon = getIcon(service.icon)
  const detailHref = serviceUrl(service.id)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-[#C9CED6] hover:shadow-[0_8px_24px_rgba(16,24,40,.08)]">
      <Link
        href={detailHref}
        className="relative aspect-[4/3] w-full overflow-hidden bg-canvas"
        aria-label={service.title}
      >
        <span className={`absolute inset-0 grid place-items-center ${service.iconBg}`}>
          <Icon size={40} className="text-[#59606C]" aria-hidden />
        </span>
        {service.badge ? (
          <span className="absolute top-2.5 left-2.5 rounded-md bg-white px-2 py-0.5 text-[12px] font-semibold text-ink">
            {service.badge.label}
          </span>
        ) : null}
      </Link>

      <div className="grid flex-1 gap-2 p-4">
        <h3 className="min-h-[42px] text-[15px] font-semibold leading-snug">
          <Link href={detailHref} className="text-left after:absolute after:inset-0 hover:text-brand-700">
            <span className="line-clamp-2">{service.title}</span>
          </Link>
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[18px] font-extrabold tracking-tight text-ink tnum">
            {service.price}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[13px] text-mute">
          <span className="inline-flex min-w-0 items-center gap-1 truncate font-medium text-ink/80">
            {service.provider}
            {service.verified ? (
              <BadgeCheck size={14} className="shrink-0 text-brand-600" aria-hidden />
            ) : null}
          </span>
          {service.verified ? <VerifiedChip compact verified /> : null}
        </div>
      </div>
    </article>
  )
}
