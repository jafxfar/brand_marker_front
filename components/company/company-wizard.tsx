"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Building2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActorType, CompanyWizardInput } from "@/types"
import { emptyCompanyWizardInput } from "@/types/company"
import {
  WIZARD_STEPS,
  type WizardStep,
  validateCompanyWizardStep,
} from "@/lib/schemas/company-wizard"
import { BasicInfoStep } from "@/components/company/steps/basic-info-step"
import { LocationStep } from "@/components/company/steps/location-step"
import { ProfileStep } from "@/components/company/steps/profile-step"
import { CertificatesStep } from "@/components/company/steps/certificates-step"
import { TeamStep } from "@/components/company/steps/team-step"
import { ReviewStep } from "@/components/company/steps/review-step"

const STEP_LABELS: Record<WizardStep, string> = {
  basic: "Основное",
  location: "Адрес",
  profile: "Профиль",
  certificates: "Сертификаты",
  team: "Команда",
  review: "Проверка",
}

type CompanyWizardProps = {
  actorType: ActorType
  basePath: string
  mode?: "create" | "edit"
  initial?: CompanyWizardInput
  limitBlocked?: boolean
  limitMessage?: string
  subscriptionHref?: string
  onSubmit: (data: CompanyWizardInput) => void
}

export const CompanyWizard = ({
  actorType,
  basePath,
  mode = "create",
  initial,
  limitBlocked,
  limitMessage,
  subscriptionHref,
  onSubmit,
}: CompanyWizardProps) => {
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<CompanyWizardInput>(
    initial ?? emptyCompanyWizardInput(),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentStep = WIZARD_STEPS[stepIndex]
  const isLast = currentStep === "review"
  const actorLabel = actorType === "buyer" ? "Заказчик" : "Поставщик"

  const handleChange = (patch: Partial<CompanyWizardInput>) => {
    setData((prev) => ({ ...prev, ...patch }))
    setErrors({})
  }

  const handleNext = () => {
    const stepErrors = validateCompanyWizardStep(currentStep, data)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    if (isLast) {
      onSubmit(data)
      return
    }
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1))
  }

  const handleBack = () => {
    setErrors({})
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  if (limitBlocked) {
    return (
      <div className="max-w-[640px] mx-auto">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Building2 size={24} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-2">Лимит компаний исчерпан</h2>
          <p className="text-sm text-muted-foreground mb-6">{limitMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={basePath}
              className="h-11 px-5 rounded-xl border border-input text-sm font-semibold flex items-center justify-center hover:bg-secondary transition-colors"
            >
              К списку компаний
            </Link>
            {subscriptionHref && (
              <Link
                href={subscriptionHref}
                className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                Оформить подписку
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[720px] mx-auto">
      <Link
        href={basePath}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Назад к компаниям
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Building2 size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">
            {mode === "edit" ? "Редактирование компании" : "Новая компания"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {actorLabel} · шаг {stepIndex + 1} из {WIZARD_STEPS.length}
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
        {WIZARD_STEPS.map((step, i) => (
          <button
            key={step}
            type="button"
            onClick={() => i < stepIndex && setStepIndex(i)}
            disabled={i > stepIndex}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              i === stepIndex
                ? "bg-primary text-primary-foreground"
                : i < stepIndex
                  ? "bg-primary/10 text-primary cursor-pointer"
                  : "bg-secondary text-muted-foreground",
            )}
          >
            {i < stepIndex ? <Check size={12} /> : <span>{i + 1}</span>}
            {STEP_LABELS[step]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 mb-6">
        {currentStep === "basic" && (
          <BasicInfoStep data={data} errors={errors} onChange={handleChange} />
        )}
        {currentStep === "location" && (
          <LocationStep data={data} errors={errors} onChange={handleChange} />
        )}
        {currentStep === "profile" && (
          <ProfileStep data={data} errors={errors} onChange={handleChange} />
        )}
        {currentStep === "certificates" && (
          <CertificatesStep data={data} errors={errors} onChange={handleChange} />
        )}
        {currentStep === "team" && (
          <TeamStep data={data} errors={errors} onChange={handleChange} />
        )}
        {currentStep === "review" && (
          <ReviewStep data={data} actorTypeLabel={actorLabel} />
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0}
          className={cn(
            "h-11 px-5 rounded-xl border border-input text-sm font-semibold flex items-center gap-2 transition-colors",
            stepIndex === 0
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-secondary",
          )}
        >
          <ArrowLeft size={16} />
          Назад
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          {isLast ? (mode === "edit" ? "Сохранить" : "Создать компанию") : "Далее"}
          {!isLast && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  )
}
