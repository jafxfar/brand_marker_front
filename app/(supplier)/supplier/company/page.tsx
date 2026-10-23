"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Check, Eye, Plus, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useSupplierCompaniesQuery,
  useUpdateSupplierCompanyMutation,
} from "@/hooks/api/use-supplier-companies-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageFrame, PageHeader } from "@/components/layout"
import { ProfileSectionCard } from "@/components/supplier/company/profile-section-card"
import { scoreLevel } from "@/lib/catalog-quality-score"
import { performerUrl } from "@/lib/marketplace-routes"
import {
  DEFAULT_SUPPLIER_PROFILE_EXTRA,
  profileCompleteness,
  readSupplierProfileExtra,
  writeSupplierProfileExtra,
  type SupplierCompanyProfileExtra,
} from "@/lib/mock/supplier-company-profile"
import { emptyCompanyWizardInput, type CompanyWithRelations } from "@/types"
import { cn } from "@/lib/utils"

const VERIFY_ITEMS = [
  "Свидетельство о регистрации",
  "Справка ИНН",
  "Паспорт директора",
  "Банковский счёт компании",
]

const FACT_FIELDS: {
  key: keyof SupplierCompanyProfileExtra["facts"]
  label: string
  placeholder: string
}[] = [
  { key: "founded", label: "Год основания", placeholder: "2018" },
  { key: "staff", label: "Сотрудников", placeholder: "25" },
  { key: "area", label: "Склад / производство", placeholder: "600 м² склад" },
  { key: "markets", label: "Где работаете", placeholder: "Душанбе, Худжанд" },
  { key: "brands", label: "Бренды и партнёры", placeholder: "Lenovo, Dell" },
]

export default function SupplierCompanyPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getMyCompany = useCompaniesStore((s) => s.getMyCompany)
  const updateLocal = useCompaniesStore((s) => s.updateCompany)

  const { data: apiCompanies, isLoading } = useSupplierCompaniesQuery(
    hydrated && useApi,
  )
  const updateMutation = useUpdateSupplierCompanyMutation()

  const company: CompanyWithRelations | null = useMemo(() => {
    if (useApi) return (apiCompanies?.items?.[0] as CompanyWithRelations) ?? null
    if (!hydrated) return null
    return getMyCompany(actorId) ?? null
  }, [useApi, apiCompanies, hydrated, getMyCompany, actorId])

  const [about, setAbout] = useState("")
  const [city, setCity] = useState("")
  const [extra, setExtra] = useState<SupplierCompanyProfileExtra>(
    DEFAULT_SUPPLIER_PROFILE_EXTRA,
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    setAbout(company.description ?? "")
    setCity(company.city ?? "")
    const stored = readSupplierProfileExtra(company.id)
    const fromProfile = company.profile
    setExtra({
      ...stored,
      facts: {
        founded:
          stored.facts.founded ||
          (fromProfile?.founded_year != null
            ? String(fromProfile.founded_year)
            : ""),
        staff:
          stored.facts.staff ||
          (fromProfile?.employees_count != null
            ? String(fromProfile.employees_count)
            : ""),
        area: stored.facts.area,
        markets: stored.facts.markets || company.city || "",
        brands: stored.facts.brands,
      },
      certs:
        stored.certs.length > 0
          ? stored.certs
          : company.certificates.map((c) => c.title),
    })
  }, [company])

  const completeness = profileCompleteness(about, extra)
  const level = scoreLevel(completeness)
  const verified = company?.verification_status === "verified"
  const publicHref = performerUrl(actorId || company?.id || 0)

  const handlePhotos = (files: FileList | null) => {
    if (!files) return
    const next = [...extra.photos]
    Array.from(files).forEach((file) => {
      if (!/^image\//.test(file.type) || next.length >= 12) return
      next.push({ src: URL.createObjectURL(file), name: file.name })
    })
    setExtra((prev) => ({ ...prev, photos: next }))
  }

  const handleCerts = (files: FileList | null) => {
    if (!files) return
    const names = Array.from(files).map((f) => f.name)
    setExtra((prev) => ({ ...prev, certs: [...prev.certs, ...names] }))
  }

  const handleSave = async () => {
    if (!company) {
      toast.error("Сначала создайте компанию")
      return
    }
    setSaving(true)
    writeSupplierProfileExtra(company.id, extra)
    try {
      if (useApi) {
        const base = emptyCompanyWizardInput()
        await updateMutation.mutateAsync({
          companyId: company.id,
          data: {
            ...base,
            title: company.title,
            legal_name: company.legal_name ?? "",
            tax_number: company.tax_number ?? "",
            description: about,
            logo: company.logo ?? "",
            country: company.country ?? "",
            city,
            address: company.address ?? "",
            website: company.website ?? "",
            founded_year: extra.facts.founded,
            employees_count: extra.facts.staff,
            annual_revenue_range:
              company.profile?.annual_revenue_range ?? "",
            languages: company.profile?.languages ?? [],
            industries: company.profile?.industries ?? [],
            category_ids: company.categories.map((c) => c.category_id),
            certificates: company.certificates.map((c) => ({
              title: c.title,
              issuer: c.issuer,
              issue_date: c.issue_date,
              expiry_date: c.expiry_date ?? "",
              file_url: c.file_url,
            })),
            team: [],
            actor_types: company.actor_types?.length
              ? company.actor_types
              : ["supplier"],
          },
        })
      } else if (updateLocal) {
        updateLocal(company.id, {
          description: about,
          city,
        })
      }
      toast.success("Страница компании сохранена")
    } catch {
      toast.error("Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  if (!hydrated || (useApi && isLoading)) {
    return (
      <PageFrame>
        <div className="h-10 w-1/3 animate-pulse rounded-xl bg-canvas" />
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-96 animate-pulse rounded-2xl bg-canvas" />
          <div className="h-64 animate-pulse rounded-2xl bg-canvas" />
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title="Страница компании"
        description="Расскажите о компании — покупатели чаще выбирают тех, кого «видно»"
        actions={
          <Button asChild variant="outline" size="lg">
            <Link href={publicHref}>
              <Eye size={16} />
              Посмотреть как покупатель
            </Link>
          </Button>
        }
      />

      {!company ? (
        <div className="rounded-2xl border border-dashed border-[#D5DAE1] bg-white px-6 py-14 text-center">
          <b className="text-[17px]">Компания ещё не создана</b>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-mute">
            Профиль компании появится здесь после регистрации исполнителя.
            Пока можно заполнить черновик страницы после создания компании в
            аккаунте.
          </p>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5">
            <ProfileSectionCard
              step="1"
              title="О компании"
              hint="Чем занимаетесь, для кого и почему с вами удобно"
            >
              <div className="grid gap-2">
                <Label htmlFor="cp-about">Описание</Label>
                <textarea
                  id="cp-about"
                  rows={5}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="min-h-[120px] w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
                  placeholder="3–5 предложений: что продаёте, сколько лет на рынке, какие гарантии и сроки"
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="cp-city">Город отгрузки</Label>
                  <Input
                    id="cp-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cp-year">Год основания</Label>
                  <Input
                    id="cp-year"
                    className="tnum"
                    value={extra.facts.founded}
                    onChange={(e) =>
                      setExtra((prev) => ({
                        ...prev,
                        facts: { ...prev.facts, founded: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard
              step="2"
              title="Фото компании"
              hint="Склад, офис, производство, команда, доставка — до 12 фото"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {extra.photos.map((photo, index) => (
                  <div
                    key={`${photo.name}-${index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt=""
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-md bg-white/95 text-red-600 shadow"
                      aria-label="Удалить"
                      onClick={() =>
                        setExtra((prev) => ({
                          ...prev,
                          photos: prev.photos.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
                {extra.photos.length < 12 ? (
                  <label className="grid aspect-[4/3] cursor-pointer place-items-center rounded-xl border-2 border-dashed border-[#C9CED6] text-center hover:border-brand-600">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        handlePhotos(e.target.files)
                        e.target.value = ""
                      }}
                    />
                    <span className="grid justify-items-center gap-1">
                      <Plus className="size-6 text-brand-700" />
                      <span className="text-[13px] font-semibold">
                        Добавить фото
                      </span>
                    </span>
                  </label>
                ) : null}
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard
              step="3"
              title="Факты о компании"
              hint="Короткие цифры, которым доверяют"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {FACT_FIELDS.map((field) => (
                  <div key={field.key} className="grid gap-2">
                    <Label htmlFor={`cpf-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`cpf-${field.key}`}
                      placeholder={field.placeholder}
                      value={extra.facts[field.key]}
                      onChange={(e) =>
                        setExtra((prev) => ({
                          ...prev,
                          facts: {
                            ...prev.facts,
                            [field.key]: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                ))}
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="cp-cl">Ключевые клиенты</Label>
                  <Input
                    id="cp-cl"
                    value={extra.clients}
                    onChange={(e) =>
                      setExtra((prev) => ({ ...prev, clients: e.target.value }))
                    }
                    placeholder="С разрешения клиентов"
                  />
                </div>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard
              step="4"
              title="Сертификаты компании"
              hint="Дилерские свидетельства, лицензии, ISO"
            >
              <div className="grid gap-2">
                {extra.certs.map((cert, index) => (
                  <div
                    key={`${cert}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-line px-4 py-3"
                  >
                    <Upload className="size-5 text-mute" aria-hidden />
                    <span className="flex-1 text-[14.5px]">{cert}</span>
                    <button
                      type="button"
                      className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                      aria-label="Удалить"
                      onClick={() =>
                        setExtra((prev) => ({
                          ...prev,
                          certs: prev.certs.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-[#C9CED6] p-4 hover:border-brand-600">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    className="sr-only"
                    onChange={(e) => {
                      handleCerts(e.target.files)
                      e.target.value = ""
                    }}
                  />
                  <Upload className="size-5 text-mute" aria-hidden />
                  <b className="text-[14px]">Загрузить документы</b>
                </label>
              </div>
            </ProfileSectionCard>

            <div className="flex justify-end">
              <Button
                type="button"
                size="lg"
                className="h-12 px-6"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                Сохранить страницу
              </Button>
            </div>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-[92px]">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
              <span className="text-[14px] font-semibold">Проверка компании</span>
              <div className="mt-2">
                {verified ? (
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700">
                    <Check className="size-4" aria-hidden />
                    Проверенная компания
                  </span>
                ) : (
                  <span className="text-[13px] font-semibold text-amber-700">
                    На проверке
                  </span>
                )}
              </div>
              <ul className="mt-3 grid gap-2 text-[14px]">
                {VERIFY_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-brand-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] text-mute">
                {verified
                  ? "Проверено администратором площадки."
                  : "Документы появятся здесь после проверки."}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
              <span className="text-[14px] font-semibold">
                Заполненность страницы
              </span>
              <b
                className={cn(
                  "mt-1 block text-[28px] font-extrabold",
                  level.textClass,
                )}
              >
                {completeness}%
              </b>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ECEEF2]">
                <div
                  className={cn("h-full", level.barClass)}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="mt-2 text-[13px] text-mute">
                {extra.photos.length < 3
                  ? "Добавьте хотя бы 3 фото компании — это +20%"
                  : "Отлично! Страница заполнена."}
              </p>
            </div>
          </aside>
        </div>
      )}
    </PageFrame>
  )
}
