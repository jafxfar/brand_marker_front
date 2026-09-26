"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LANDING_HOW_IT_WORKS_STEPS,
  type LandingRole,
} from "@/lib/landing-copy"

const TABS: { value: LandingRole; label: string }[] = [
  { value: "buyer", label: "Для заказчиков" },
  { value: "supplier", label: "Для исполнителей" },
]

export const LandingHowItWorks = () => {
  const [role, setRole] = useState<LandingRole>("buyer")
  const steps = LANDING_HOW_IT_WORKS_STEPS[role]

  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 border-b border-border bg-card"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-[1440px] mx-auto px-6 py-16 sm:py-20">
        <h2
          id="how-it-works-heading"
          className="text-2xl sm:text-3xl font-black text-foreground"
        >
          Как это работает?
        </h2>
        <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
          Три шага — от заявки до безопасной оплаты.
        </p>

        <div
          className="mt-8 inline-flex rounded-xl border border-border bg-secondary/60 p-1"
          role="tablist"
          aria-label="Роль на площадке"
        >
          {TABS.map((tab) => {
            const active = role === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setRole(tab.value)}
                className={cn(
                  "h-10 px-4 sm:px-5 rounded-lg text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <ol
          key={role}
          className="mt-10 grid gap-6 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.Icon size={20} aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    Шаг {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-foreground">
                    {step.title.replace(/^\d+\.\s*/, "")}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
