"use client"

import { useState } from "react"
import Link from "next/link"
import { BadgeCheck, Eye, Heart, MapPin, Star } from "lucide-react"
import type { MarketplaceService } from "@/types/marketplace"
import { getIcon } from "@/lib/icon-map"
import { loginRedirect, serviceUrl } from "@/lib/marketplace-routes"

type ServiceCardProps = {
  service: MarketplaceService
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const [isSaved, setIsSaved] = useState(false)
  const Icon = getIcon(service.icon)

  const handleToggleSave = () => setIsSaved((prev) => !prev)

  const handleRequest = () => {
    window.location.href = loginRedirect(`/customer/rfqs/new?service=${service.id}`)
  }

  return (
    <div className="bg-white border border-border rounded-2xl hover:shadow-lg hover:border-primary/25 transition-all duration-200 group relative overflow-hidden">
      <div className={`${service.iconBg} h-[110px] flex items-center justify-center relative`}>
        {service.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${service.badge.className} z-10 leading-4`}>
            {service.badge.label}
          </span>
        )}
        <button
          type="button"
          onClick={handleToggleSave}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-all"
          aria-label="Сохранить"
        >
          <Heart
            size={14}
            className={isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}
          />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
          <Icon size={26} className={service.iconColor} />
        </div>
      </div>

      <div className="p-3.5">
        <Link
          href={serviceUrl(service.id)}
          className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors leading-snug line-clamp-2 block"
        >
          {service.title}
        </Link>

        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs text-muted-foreground truncate">{service.provider}</span>
            {service.verified && <BadgeCheck size={12} className="text-primary flex-shrink-0" />}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-1">
          <MapPin size={11} className="text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">{service.city}</span>
        </div>

        <div className="flex flex-wrap gap-1 mt-2.5">
          {service.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg font-medium">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-foreground">{service.rating}</span>
            <span className="text-[10px] text-muted-foreground">({service.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Eye size={10} />
            <span>{service.views}</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
          <div className="text-sm font-black text-primary">{service.price}</div>
          <button
            type="button"
            onClick={handleRequest}
            className="text-[11px] font-semibold text-primary hover:bg-secondary px-2 py-1 rounded-lg transition-colors"
          >
            Запрос
          </button>
        </div>
      </div>
    </div>
  )
}
