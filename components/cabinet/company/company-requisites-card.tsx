"use client"

import { Clock, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { initialsFromName } from "@/lib/company-team"

export type CompanyRequisites = {
  name: string
  verified: boolean
  inn: string
  form: string
  city: string
  bank: string
  account: string
}

type CompanyRequisitesCardProps = {
  company: CompanyRequisites
}

export const CompanyRequisitesCard = ({ company }: CompanyRequisitesCardProps) => {
  const rows: [string, string][] = [
    ["ИНН", company.inn],
    ["Форма", company.form],
    ["Город", company.city],
    ["Банк", company.bank],
    ["Р/с", company.account],
  ]

  return (
    <aside className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] md:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#EEF0F3] text-[13px] font-bold text-ink">
          {initialsFromName(company.name)}
        </span>
        <div className="min-w-0">
          <b className="block truncate text-[15px]">{company.name}</b>
          <div className="mt-0.5">
            {company.verified ? (
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700">
                <ShieldCheck className="size-4" aria-hidden />
                Проверенная компания
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-amber-700">
                <Clock className="size-4" aria-hidden />
                На проверке
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-[13.5px]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[80px_1fr] gap-2">
            <dt className="text-mute">{label}</dt>
            <dd className="tnum">{value || "—"}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[13px] text-mute">
        Название, директор и реквизиты меняются только через проверку
        администратора площадки.
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full"
        onClick={() =>
          toast.success("Заявка на изменение данных отправлена администратору")
        }
      >
        Запросить изменение
      </Button>
    </aside>
  )
}
