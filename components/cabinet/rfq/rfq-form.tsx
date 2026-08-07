"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Briefcase, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { rfqCategories } from "@/lib/rfq-categories-list"
import { validateRfqForm, type RfqFormValues } from "@/lib/schemas/rfq-form"

type FormState = {
  type: "product" | "service"
  title: string
  category_id: string
  description: string
  budget_type: "fixed" | "range" | "open"
  budget_from: string
  budget_to: string
  currency: RfqFormValues["currency"]
  deadline: string
  visibility: "public" | "invited_only"
  quantity: string
  delivery_country: string
  delivery_city: string
  delivery_address: string
  delivery_date: string
  project_duration: string
  start_date: string
  team_size_required: string
  experience_required: string
}
import type { RfqCreate, RfqWithRelations } from "@/types"
import { budgetTypeMeta } from "@/lib/rfq-display"

type PreviewAttachment = {
  id: string
  file_name: string
}

type RfqFormProps = {
  initial?: RfqWithRelations
  invitedSupplierId?: number
  invitedSupplierName?: string
  pendingAttachments?: PreviewAttachment[]
  cancelHref: string
  onSaveDraft: (input: RfqCreate) => void
  onPublish: (input: RfqCreate) => void
  onAddAttachment?: (file: File) => void
  onRemoveAttachment?: (attachmentId: string) => void
  onRemovePendingAttachment?: (id: string) => void
}

const defaultValues = (
  initial?: RfqWithRelations,
  invitedSupplierId?: number,
): FormState => {
  if (!initial) {
    return {
      type: "service",
      title: "",
      category_id: "",
      description: "",
      budget_type: "fixed",
      budget_from: "",
      budget_to: "",
      currency: "RUB",
      deadline: "",
      visibility: invitedSupplierId ? "invited_only" : "public",
      project_duration: "",
      start_date: "",
      team_size_required: "",
      experience_required: "",
      quantity: "1",
      delivery_country: "Таджикистан",
      delivery_city: "",
      delivery_address: "",
      delivery_date: "",
    }
  }

  return {
    type: initial.type,
    title: initial.title,
    category_id: initial.category_id,
    description: initial.description ?? "",
    budget_type: initial.budget_type,
    budget_from: initial.budget_from != null ? String(initial.budget_from) : "",
    budget_to: initial.budget_to != null ? String(initial.budget_to) : "",
    currency: initial.currency as FormState["currency"],
    deadline: initial.deadline,
    visibility: initial.visibility,
    quantity: initial.type === "product" ? String(initial.quantity) : "1",
    delivery_country: initial.type === "product" ? initial.delivery_country : "Таджикистан",
    delivery_city: initial.type === "product" ? initial.delivery_city : "",
    delivery_address: initial.type === "product" ? (initial.delivery_address ?? "") : "",
    delivery_date: initial.type === "product" ? initial.delivery_date : "",
    project_duration: initial.type === "service" ? initial.project_duration : "",
    start_date: initial.type === "service" ? initial.start_date : "",
    team_size_required:
      initial.type === "service" && initial.team_size_required != null
        ? String(initial.team_size_required)
        : "",
    experience_required:
      initial.type === "service" ? (initial.experience_required ?? "") : "",
  }
}

const toFormValues = (values: FormState): RfqFormValues =>
  values.type === "product"
    ? {
        type: "product",
        title: values.title,
        category_id: values.category_id,
        description: values.description,
        budget_type: values.budget_type,
        budget_from: values.budget_from,
        budget_to: values.budget_to,
        currency: values.currency,
        deadline: values.deadline,
        visibility: values.visibility,
        quantity: values.quantity,
        delivery_country: values.delivery_country,
        delivery_city: values.delivery_city,
        delivery_address: values.delivery_address,
        delivery_date: values.delivery_date,
      }
    : {
        type: "service",
        title: values.title,
        category_id: values.category_id,
        description: values.description,
        budget_type: values.budget_type,
        budget_from: values.budget_from,
        budget_to: values.budget_to,
        currency: values.currency,
        deadline: values.deadline,
        visibility: values.visibility,
        project_duration: values.project_duration,
        start_date: values.start_date,
        team_size_required: values.team_size_required,
        experience_required: values.experience_required,
      }

const toRfqCreate = (values: FormState): RfqCreate => {
  const parsed = toFormValues(values)
  const budgetFrom =
    parsed.budget_type === "open" ? null : Number(parsed.budget_from) || null
  const budgetTo =
    parsed.budget_type === "range" ? Number(parsed.budget_to) || null : null

  const base = {
    actor_id: "",
    created_by: "",
    title: parsed.title.trim(),
    description: parsed.description.trim() || null,
    category_id: parsed.category_id,
    budget_type: parsed.budget_type,
    budget_from: budgetFrom,
    budget_to: budgetTo,
    currency: parsed.currency,
    deadline: parsed.deadline,
    visibility: parsed.visibility,
    status: "draft" as const,
  }

  if (parsed.type === "product") {
    return {
      ...base,
      type: "product",
      quantity: Number(parsed.quantity),
      delivery_country: parsed.delivery_country.trim(),
      delivery_city: parsed.delivery_city.trim(),
      delivery_address: parsed.delivery_address?.trim() || null,
      delivery_date: parsed.delivery_date,
    }
  }

  return {
    ...base,
    type: "service",
    project_duration: parsed.project_duration.trim(),
    start_date: parsed.start_date,
    team_size_required: parsed.team_size_required
      ? Number(parsed.team_size_required)
      : null,
    experience_required: parsed.experience_required?.trim() || null,
  }
}

export const RfqForm = ({
  initial,
  invitedSupplierId,
  invitedSupplierName,
  pendingAttachments = [],
  cancelHref,
  onSaveDraft,
  onPublish,
  onAddAttachment,
  onRemoveAttachment,
  onRemovePendingAttachment,
}: RfqFormProps) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState<FormState>(() =>
    defaultValues(initial, invitedSupplierId),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const inputClass = (field: string) =>
    cn(
      "w-full h-11 px-4 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20",
      errors[field] ? "border-destructive" : "border-input focus:border-primary",
    )

  const handleValidate = (): boolean => {
    const e = validateRfqForm(toFormValues(values))
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSaveDraft = () => {
    if (!handleValidate()) return
    onSaveDraft(toRfqCreate(values))
  }

  const handlePublish = () => {
    if (!handleValidate()) return
    onPublish(toRfqCreate(values))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onAddAttachment) return
    onAddAttachment(file)
    event.target.value = ""
  }

  return (
    <div className="max-w-[820px] mx-auto">
      <Link
        href={cancelHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Назад
      </Link>

      <h1 className="text-2xl font-black text-foreground mb-1">
        {initial ? "Редактирование заявки" : "Создание заявки"}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Опишите, что вам нужно — поставщики смогут прислать предложения
      </p>

      {invitedSupplierName && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-semibold text-foreground">Приглашение: </span>
          <span className="text-muted-foreground">
            Заявка будет доступна только для {invitedSupplierName}
          </span>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "service" as const, title: "Услуга", desc: "Работа или сервис", Icon: Briefcase },
            { value: "product" as const, title: "Товар", desc: "Закупка товара", Icon: ShoppingCart },
          ]).map(({ value, title, desc, Icon }) => {
            const active = values.type === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setField("type", value)}
                disabled={!!initial}
                className={cn(
                  "text-left rounded-2xl border-2 p-4 transition-all",
                  active ? "border-primary bg-secondary shadow-sm" : "border-border bg-white hover:border-primary/40",
                  initial && "opacity-70 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-2.5",
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="text-sm font-bold text-foreground">{title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
              </button>
            )
          })}
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="rfq-title" className="block text-sm font-medium text-foreground mb-1.5">
              Заголовок
            </label>
            <input
              id="rfq-title"
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              className={inputClass("title")}
              placeholder="Краткое название запроса"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="rfq-category" className="block text-sm font-medium text-foreground mb-1.5">
              Категория
            </label>
            <select
              id="rfq-category"
              value={values.category_id}
              onChange={(e) => setField("category_id", e.target.value)}
              className={cn(inputClass("category_id"), "appearance-none")}
            >
              <option value="">Выберите категорию</option>
              {rfqCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id}</p>}
          </div>

          <div>
            <label htmlFor="rfq-description" className="block text-sm font-medium text-foreground mb-1.5">
              Описание
            </label>
            <textarea
              id="rfq-description"
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              className={cn(
                "w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none",
                errors.description ? "border-destructive" : "border-input focus:border-primary",
              )}
              placeholder="Подробные требования и контекст"
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Тип бюджета</label>
            <div className="grid grid-cols-3 gap-2">
              {(["fixed", "range", "open"] as const).map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setField("budget_type", bt)}
                  className={cn(
                    "h-10 rounded-xl border text-xs font-semibold transition-colors",
                    values.budget_type === bt
                      ? "border-primary bg-secondary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {budgetTypeMeta[bt]}
                </button>
              ))}
            </div>
          </div>

          {values.budget_type !== "open" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget-from" className="block text-sm font-medium text-foreground mb-1.5">
                  {values.budget_type === "range" ? "Бюджет от" : "Бюджет"}
                </label>
                <input
                  id="budget-from"
                  type="number"
                  min={0}
                  value={values.budget_from}
                  onChange={(e) => setField("budget_from", e.target.value)}
                  className={inputClass("budget_from")}
                />
                {errors.budget_from && <p className="text-xs text-destructive mt-1">{errors.budget_from}</p>}
              </div>
              {values.budget_type === "range" && (
                <div>
                  <label htmlFor="budget-to" className="block text-sm font-medium text-foreground mb-1.5">
                    Бюджет до
                  </label>
                  <input
                    id="budget-to"
                    type="number"
                    min={0}
                    value={values.budget_to}
                    onChange={(e) => setField("budget_to", e.target.value)}
                    className={inputClass("budget_to")}
                  />
                  {errors.budget_to && <p className="text-xs text-destructive mt-1">{errors.budget_to}</p>}
                </div>
              )}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-1.5">
                  Валюта
                </label>
                <select
                  id="currency"
                  value={values.currency}
                  onChange={(e) => setField("currency", e.target.value as FormState["currency"])}
                  className={cn(inputClass("currency"), "appearance-none")}
                >
                  {(["RUB", "USD", "EUR", "KZT", "CNY"] as const).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-1.5">
              Дедлайн откликов
            </label>
            <input
              id="deadline"
              type="date"
              value={values.deadline}
              onChange={(e) => setField("deadline", e.target.value)}
              className={inputClass("deadline")}
            />
            {errors.deadline && <p className="text-xs text-destructive mt-1">{errors.deadline}</p>}
          </div>

          {values.type === "product" ? (
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-foreground mb-1.5">
                  Количество
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  value={values.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                  className={inputClass("quantity")}
                />
                {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <label htmlFor="delivery-date" className="block text-sm font-medium text-foreground mb-1.5">
                  Дата поставки
                </label>
                <input
                  id="delivery-date"
                  type="date"
                  value={values.delivery_date}
                  onChange={(e) => setField("delivery_date", e.target.value)}
                  className={inputClass("delivery_date")}
                />
                {errors.delivery_date && <p className="text-xs text-destructive mt-1">{errors.delivery_date}</p>}
              </div>
              <div>
                <label htmlFor="delivery-country" className="block text-sm font-medium text-foreground mb-1.5">
                  Страна
                </label>
                <input
                  id="delivery-country"
                  value={values.delivery_country}
                  onChange={(e) => setField("delivery_country", e.target.value)}
                  className={inputClass("delivery_country")}
                />
                {errors.delivery_country && <p className="text-xs text-destructive mt-1">{errors.delivery_country}</p>}
              </div>
              <div>
                <label htmlFor="delivery-city" className="block text-sm font-medium text-foreground mb-1.5">
                  Город
                </label>
                <input
                  id="delivery-city"
                  value={values.delivery_city}
                  onChange={(e) => setField("delivery_city", e.target.value)}
                  className={inputClass("delivery_city")}
                />
                {errors.delivery_city && <p className="text-xs text-destructive mt-1">{errors.delivery_city}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-foreground mb-1.5">
                  Длительность проекта
                </label>
                <input
                  id="duration"
                  value={values.project_duration}
                  onChange={(e) => setField("project_duration", e.target.value)}
                  placeholder="3 месяца"
                  className={inputClass("project_duration")}
                />
                {errors.project_duration && <p className="text-xs text-destructive mt-1">{errors.project_duration}</p>}
              </div>
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-foreground mb-1.5">
                  Дата начала
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={values.start_date}
                  onChange={(e) => setField("start_date", e.target.value)}
                  className={inputClass("start_date")}
                />
                {errors.start_date && <p className="text-xs text-destructive mt-1">{errors.start_date}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Вложения</label>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Загрузить файл"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
            >
              <Paperclip size={16} />
              Добавить файл
            </button>
            {(initial?.attachments.length ?? 0) > 0 || pendingAttachments.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {initial?.attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{file.file_name}</span>
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        onClick={() => onRemoveAttachment(file.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Удалить ${file.file_name}`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
                {pendingAttachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{file.file_name}</span>
                    {onRemovePendingAttachment && (
                      <button
                        type="button"
                        onClick={() => onRemovePendingAttachment(file.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Удалить ${file.file_name}`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href={cancelHref}
            className="h-11 px-5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors flex items-center"
          >
            Отмена
          </Link>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="h-11 px-5 rounded-xl border border-primary text-primary text-sm font-bold hover:bg-secondary transition-colors"
          >
            Сохранить черновик
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors"
          >
            Опубликовать
          </button>
        </div>
      </div>
    </div>
  )
}
