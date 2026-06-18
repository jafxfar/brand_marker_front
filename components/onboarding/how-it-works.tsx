"use client"

import { useEffect, useState } from "react"
import { FileText, Inbox, ShieldCheck, Building2, Send, Wallet, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = {
  Icon: LucideIcon
  title: string
  description: string
}

const STEPS: Record<"buyer" | "supplier", Step[]> = {
  buyer: [
    {
      Icon: FileText,
      title: "1. Создайте заявку",
      description: "Опишите, какой товар или услуга вам нужны, бюджет и сроки.",
    },
    {
      Icon: Inbox,
      title: "2. Получите предложения",
      description: "Проверенные поставщики пришлют цены и условия. Сравните и выберите лучшее.",
    },
    {
      Icon: ShieldCheck,
      title: "3. Оплатите безопасно",
      description: "Деньги замораживаются на счёте площадки и уходят поставщику только после приёмки.",
    },
  ],
  supplier: [
    {
      Icon: Building2,
      title: "1. Заполните компанию и каталог",
      description: "Добавьте данные о компании и позиции каталога, чтобы вам доверяли заказчики.",
    },
    {
      Icon: Send,
      title: "2. Откликайтесь на заявки",
      description: "Находите заявки заказчиков и отправляйте отклики с ценой и сроками.",
    },
    {
      Icon: Wallet,
      title: "3. Работайте и получайте оплату",
      description: "Заключайте договоры, выполняйте этапы и получайте оплату после приёмки.",
    },
  ],
}

const TITLES: Record<"buyer" | "supplier", string> = {
  buyer: "Как это работает",
  supplier: "Как это работает",
}

interface HowItWorksProps {
  variant: "buyer" | "supplier"
  className?: string
}

/**
 * Закрываемая карточка-подсказка из 3 шагов для новых пользователей.
 * Состояние скрытия сохраняется в localStorage, чтобы не показывать повторно.
 */
export const HowItWorks = ({ variant, className }: HowItWorksProps) => {
  const storageKey = `how-it-works-dismissed:${variant}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(localStorage.getItem(storageKey) !== "1")
  }, [storageKey])

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "1")
    setVisible(false)
  }

  if (!visible) return null

  const steps = STEPS[variant]

  return (
    <section
      className={cn(
        "relative rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6",
        className,
      )}
      aria-label={TITLES[variant]}
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Скрыть подсказку"
        className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none"
      >
        <X size={16} />
      </button>

      <h2 className="text-base font-black text-foreground mb-1">{TITLES[variant]}</h2>
      <p className="text-sm text-muted-foreground mb-5">
        Три простых шага, чтобы начать работу на площадке.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex flex-col gap-2 rounded-xl bg-white border border-border p-4"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <step.Icon size={18} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">{step.title}</p>
            <p className="text-xs text-muted-foreground leading-snug">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
