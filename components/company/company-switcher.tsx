"use client"

import Link from "next/link"
import { Building2, ChevronDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import type { ActorType } from "@/types"

type CompanySwitcherProps = {
  actorType: ActorType
  basePath: string
}

export const CompanySwitcher = ({ actorType, basePath }: CompanySwitcherProps) => {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const switchCompany = useAuthStore((s) => s.switchCompany)
  const companies = useCompaniesStore((s) => s.companies)

  if (!hydrated || !user) return null

  const myCompanies = companies.filter(
    (c) =>
      user.companyIds.includes(c.id) && c.actor_type === actorType,
  )

  const activeCompany = myCompanies.find(
    (c) => c.id === user.activeCompanyId,
  ) ?? myCompanies[0]

  if (myCompanies.length === 0) {
    return (
      <Link
        href={`${basePath}/new`}
        className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed border-primary text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
      >
        <Plus size={14} />
        Создать компанию
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-input bg-background hover:bg-secondary transition-colors max-w-[200px]"
          aria-label="Выбрать компанию"
        >
          <Building2 size={14} className="text-primary shrink-0" />
          <span className="text-xs font-semibold truncate">
            {activeCompany?.title ?? "Компания"}
          </span>
          <ChevronDown size={12} className="text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Мои компании</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {myCompanies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => switchCompany(company.id)}
            className="cursor-pointer"
          >
            <Building2 size={14} />
            <span className="truncate">{company.title}</span>
            {company.id === user.activeCompanyId && (
              <span className="ml-auto text-[10px] text-primary font-bold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={basePath} className="cursor-pointer">
            Все компании
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${basePath}/new`} className="cursor-pointer">
            <Plus size={14} />
            Создать компанию
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
