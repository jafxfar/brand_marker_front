"use client"

import { useEffect, useMemo, useState } from "react"
import { Info, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useBuyerCompaniesQuery } from "@/hooks/api/use-buyer-companies-query"
import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader } from "@/components/layout"
import { EmployeeList } from "@/components/cabinet/company/employee-list"
import { PurchaseRulesCard } from "@/components/cabinet/company/purchase-rules-card"
import {
  CompanyRequisitesCard,
  type CompanyRequisites,
} from "@/components/cabinet/company/company-requisites-card"
import { InviteEmployeeDialog } from "@/components/cabinet/company/invite-employee-dialog"
import {
  BUYER_ROLE_RIGHTS,
  MOCK_BUYER_COMPANY_LOG,
  MOCK_BUYER_EMPLOYEES,
  formatEmployeeLimit,
  readPurchaseRules,
  writePurchaseRules,
  type BuyerCompanyLogEntry,
  type BuyerEmployee,
  type BuyerEmployeeRole,
  type PurchaseRuleId,
  type PurchaseRules,
} from "@/lib/mock/buyer-employees"
import type { CompanyWithRelations } from "@/types"

const nowLogStamp = () => {
  const d = new Date()
  const months = [
    "янв",
    "фев",
    "мар",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ]
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${d.getDate()} ${months[d.getMonth()]}, ${hh}:${mm}`
}

export default function CustomerCompanyPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getMyCompany = useCompaniesStore((s) => s.getMyCompany)

  const { data: apiCompanies } = useBuyerCompaniesQuery(hydrated && useApi)

  const [employees, setEmployees] = useState<BuyerEmployee[]>(MOCK_BUYER_EMPLOYEES)
  const [log, setLog] = useState<BuyerCompanyLogEntry[]>(MOCK_BUYER_COMPANY_LOG)
  const [rules, setRules] = useState<PurchaseRules>(() => ({
    rule1: true,
    rule2: true,
    rule3: false,
  }))
  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => {
    if (hydrated) setRules(readPurchaseRules())
  }, [hydrated])

  const isBoss = employees.some((e) => e.me && e.role === "Руководитель")
  const bossName =
    employees.find((e) => e.me)?.name ?? user?.name ?? "Руководитель"

  const pushLog = (text: string) => {
    setLog((prev) => [
      { at: nowLogStamp(), who: bossName, text },
      ...prev,
    ])
  }

  const company: CompanyRequisites = useMemo(() => {
    const fromApi = (apiCompanies?.items?.[0] ?? null) as CompanyWithRelations | null
    const fromStore =
      !useApi && hydrated && actorId ? getMyCompany(actorId) : null
    const source = fromApi ?? fromStore
    const name =
      source?.title ??
      user?.company?.trim() ??
      "ООО «Сомон Трейд»"
    return {
      name,
      verified: source?.verification_status === "verified",
      inn: source?.tax_number?.trim() || "020033881",
      form: "ООО",
      city: source?.city?.trim() || "Душанбе",
      bank: "Амонатбонк",
      account: "20202 972 0 0000 012345",
    }
  }, [apiCompanies, useApi, hydrated, actorId, getMyCompany, user?.company])

  const handleRuleChange = (id: PurchaseRuleId, checked: boolean) => {
    setRules((prev) => {
      const next = { ...prev, [id]: checked }
      writePurchaseRules(next)
      return next
    })
  }

  const handleRoleChange = (id: string, role: BuyerEmployeeRole) => {
    const target = employees.find((e) => e.id === id)
    if (!target || target.role === role) return
    const old = target.role
    setEmployees((prev) =>
      prev.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              role,
              rights: BUYER_ROLE_RIGHTS[role],
              limit: role === "Наблюдатель" ? 0 : e.limit,
            },
      ),
    )
    pushLog(`Изменил роль ${target.name}: ${old} → ${role}`)
    toast.success(`${target.name}: теперь ${role.toLowerCase()}`)
  }

  const handleLimitChange = (id: string, limit: number) => {
    const target = employees.find((e) => e.id === id)
    if (!target) return
    setEmployees((prev) =>
      prev.map((e) => (e.id !== id ? e : { ...e, limit })),
    )
    pushLog(`Изменил лимит ${target.name}: ${formatEmployeeLimit(limit)}`)
  }

  const handleRemove = (id: string) => {
    const target = employees.find((e) => e.id === id)
    if (!target) return
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    pushLog(`Удалил сотрудника ${target.name} (${target.role.toLowerCase()})`)
  }

  const handleInvite = (employee: BuyerEmployee) => {
    setEmployees((prev) => [...prev, employee])
    pushLog(
      `Пригласил ${employee.name} (${employee.role.toLowerCase()})`,
    )
  }

  if (!hydrated) {
    return (
      <PageFrame>
        <div className="h-10 w-1/3 animate-pulse rounded-xl bg-canvas" />
        <div className="mt-6 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-80 animate-pulse rounded-2xl bg-canvas" />
          <div className="h-64 animate-pulse rounded-2xl bg-canvas" />
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title="Компания и сотрудники"
        description="Реквизиты, роли и лимиты покупок"
        actions={
          isBoss ? (
            <Button type="button" size="lg" onClick={() => setInviteOpen(true)}>
              <Plus size={16} />
              Пригласить сотрудника
            </Button>
          ) : null
        }
      />

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-5">
          <EmployeeList
            employees={employees}
            isBoss={isBoss}
            onChangeRole={handleRoleChange}
            onChangeLimit={handleLimitChange}
            onRemove={handleRemove}
          />

          <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] md:p-6">
            <span className="text-[13px] font-semibold text-mute">
              История изменений
            </span>
            <ul className="mt-3 grid gap-2.5 text-[14px]">
              {log.slice(0, 6).map((entry, index) => (
                <li
                  key={`${entry.at}-${index}`}
                  className="grid grid-cols-[110px_1fr] gap-3"
                >
                  <span className="tnum text-[12.5px] text-mute">{entry.at}</span>
                  <span>
                    <b className="font-semibold">{entry.who}:</b> {entry.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <PurchaseRulesCard rules={rules} onChange={handleRuleChange} />
        </div>

        <CompanyRequisitesCard company={company} />
      </div>

      {!isBoss ? (
        <p className="mt-4 flex items-start gap-2 text-[13.5px] text-mute">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Изменять роли и лимиты может только руководитель компании.
        </p>
      ) : null}

      <InviteEmployeeDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />
    </PageFrame>
  )
}
