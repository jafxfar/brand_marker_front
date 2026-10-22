"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import type { MarketplaceService } from "@/types/marketplace"
import { getIcon } from "@/lib/icon-map"
import { serviceUrl } from "@/lib/marketplace-routes"

type ServiceCardProps = {
  service: MarketplaceService
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const Icon = getIcon(service.icon)
  const detailHref = serviceUrl(service.id)
  const [imageBroken, setImageBroken] = useState(false)
  const showImage = Boolean(service.imageUrl) && !imageBroken
  const metaParts = [service.moqLabel, service.activityLabel].filter(Boolean)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:border-[#C9CED6] hover:shadow-[0_6px_20px_rgba(16,24,40,.08)]">
      <Link
        href={detailHref}
        className="relative aspect-square w-full overflow-hidden bg-canvas"
        aria-label={service.title}
      >
        {showImage ? (
          <Image
            src={service.imageUrl!}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 16vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <span className={`absolute inset-0 grid place-items-center ${service.iconBg}`}>
            <Icon size={36} className="text-[#59606C]" aria-hidden />
          </span>
        )}
        {service.badge ? (
          <span className="absolute left-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-semibold text-ink shadow-sm">
            {service.badge.label}
          </span>
        ) : null}
      </Link>

      <div className="grid flex-1 gap-1 p-2.5 sm:p-3">
        <h3 className="min-h-[2.5rem] text-[13px] font-medium leading-snug text-ink sm:text-[14px]">
          <Link
            href={detailHref}
            className="after:absolute after:inset-0 hover:text-brand-700"
          >
            <span className="line-clamp-2">{service.title}</span>
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-0.5">
          <span className="text-[16px] font-extrabold tracking-tight text-ink tnum sm:text-[17px]">
            {service.price}
          </span>
          {service.verified ? (
            <BadgeCheck
              size={15}
              className="shrink-0 text-brand-600"
              aria-label="Проверенный поставщик"
            />
          ) : null}
        </div>

        {metaParts.length > 0 ? (
          <p className="truncate text-[12px] text-mute">
            {metaParts.join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex min-w-0 items-center gap-1 pt-1 text-[12px] text-mute">
          <span className="truncate font-medium text-ink/75">{service.provider}</span>
          {service.city && service.city !== "—" ? (
            <>
              <span aria-hidden>·</span>
              <span className="shrink-0 truncate">{service.city}</span>
            </>
          ) : null}
        </div>
      </div>
    </article>
  )
}
