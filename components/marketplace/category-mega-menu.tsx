"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useMemo } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, Menu } from "lucide-react"
import { getAllCategories } from "@/lib/mock/categories"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicCategoriesQuery } from "@/hooks/api/use-public-query"
import { mergeByKey, mapCategoryTreeToMarketplace } from "@/lib/marketplace-hybrid"
import { getIcon } from "@/lib/icon-map"
import { categoriesUrl, categoryUrl } from "@/lib/marketplace-routes"
import type { MarketplaceCategory } from "@/types/marketplace"

type CategoryMegaMenuProps = {
  variant?: "search" | "nav"
  onNavigate?: () => void
}

export const CategoryMegaMenu = ({ variant = "nav", onNavigate }: CategoryMegaMenuProps) => {
  const useApi = isApiEnabled()
  const { data: apiCategories } = usePublicCategoriesQuery(useApi)
  const mockCategories = getAllCategories()
  const categories = useMemo(() => {
    if (!useApi || !apiCategories?.length) return mockCategories
    const apiMapped = mapCategoryTreeToMarketplace(apiCategories)
    return mergeByKey(mockCategories, apiMapped, "slug")
  }, [useApi, apiCategories, mockCategories])
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>(categories[0])
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => setIsOpen(false), [])

  const handleToggle = () => setIsOpen((prev) => !prev)

  const handleNavigate = () => {
    handleClose()
    onNavigate?.()
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose()
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) handleClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, handleClose])

  const triggerClass =
    variant === "search"
      ? "flex items-center gap-1.5 px-4 bg-secondary text-sm text-foreground border-r border-border whitespace-nowrap hover:bg-accent transition-colors h-11 font-medium"
      : "flex items-center gap-2 py-3 pr-5 border-r border-border text-sm font-semibold hover:text-primary transition-colors whitespace-nowrap"

  const ActiveIcon = getIcon(activeCategory.icon)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={triggerClass}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Все категории"
      >
        {variant === "nav" && <Menu size={15} />}
        <span className={variant === "search" ? "hidden md:block text-secondary-foreground" : undefined}>
          Все категории
        </span>
        <ChevronDown size={variant === "search" ? 14 : 12} className={variant === "search" ? "text-secondary-foreground" : undefined} />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full bg-white border border-border shadow-2xl z-[60] rounded-2xl overflow-hidden ${
            variant === "search" ? "left-0 mt-2 w-[min(720px,calc(100vw-3rem))]" : "left-0 mt-0 w-[min(720px,calc(100vw-3rem))]"
          }`}
          role="menu"
          aria-label="Категории услуг"
        >
          <div className="flex min-h-[320px]">
            <div className="w-[240px] border-r border-border bg-secondary/30 overflow-y-auto max-h-[400px]">
              {categories.map((category) => {
                const Icon = getIcon(category.icon)
                const isActive = activeCategory.id === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onMouseEnter={() => setActiveCategory(category)}
                    onFocus={() => setActiveCategory(category)}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors ${
                      isActive ? "bg-white text-primary font-semibold" : "text-foreground hover:bg-white/70"
                    }`}
                  >
                    <Icon size={15} className={isActive ? "text-primary" : "text-muted-foreground"} />
                    <span className="leading-tight">{category.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex-1 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${activeCategory.iconBg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                  <ActiveIcon size={18} className={activeCategory.iconColor} />
                </div>
                <div>
                  <Link
                    href={categoryUrl(activeCategory.slug)}
                    onClick={handleNavigate}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {activeCategory.label}
                  </Link>
                  <p className="text-xs text-muted-foreground">{activeCategory.count} услуг</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeCategory.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={categoryUrl(activeCategory.slug, sub.slug)}
                    onClick={handleNavigate}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors group"
                  >
                    <span>{sub.label}</span>
                    <ChevronRight size={13} className="text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>

              <Link
                href={categoriesUrl()}
                onClick={handleNavigate}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-5 hover:underline"
              >
                Все категории <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
