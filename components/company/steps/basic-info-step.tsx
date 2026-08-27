"use client"

import type { ActorType, CompanyWizardInput } from "@/types"
import { WizardField, wizardInputClass, wizardTextareaClass } from "@/components/company/wizard-field"

type BasicInfoStepProps = {
  data: CompanyWizardInput
  errors: Record<string, string>
  onChange: (patch: Partial<CompanyWizardInput>) => void
  showActorTypes?: boolean
}

const toggleActorType = (
  current: ActorType[],
  side: ActorType,
): ActorType[] => {
  if (current.includes(side)) {
    const next = current.filter((t) => t !== side)
    return next.length > 0 ? next : current
  }
  return [...current, side]
}

export const BasicInfoStep = ({
  data,
  errors,
  onChange,
  showActorTypes = true,
}: BasicInfoStepProps) => (
  <div className="space-y-5">
    {showActorTypes && (
      <WizardField label="Роли компании" required error={errors.actor_types}>
        <div className="flex flex-wrap gap-3">
          {(["buyer", "supplier"] as const).map((side) => {
            const checked = data.actor_types.includes(side)
            const label = side === "buyer" ? "Заказчик" : "Исполнитель"
            return (
              <label
                key={side}
                className={`flex items-center gap-2 h-11 px-4 rounded-xl border cursor-pointer transition-colors ${
                  checked
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-input hover:bg-secondary"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange({ actor_types: toggleActorType(data.actor_types, side) })
                  }
                  className="accent-primary"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Компания может участвовать как заказчик, исполнитель или в обеих ролях
        </p>
      </WizardField>
    )}

    <WizardField label="Название компании" required error={errors.title}>
      <input
        type="text"
        value={data.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Например, ТехноСнаб"
        className={wizardInputClass}
      />
    </WizardField>

    <WizardField label="Юридическое название" error={errors.legal_name}>
      <input
        type="text"
        value={data.legal_name}
        onChange={(e) => onChange({ legal_name: e.target.value })}
        placeholder="ООО «Название»"
        className={wizardInputClass}
      />
    </WizardField>

    <WizardField label="ИНН / налоговый номер" error={errors.tax_number}>
      <input
        type="text"
        value={data.tax_number}
        onChange={(e) => onChange({ tax_number: e.target.value })}
        placeholder="7701234567"
        className={wizardInputClass}
      />
    </WizardField>

    <WizardField label="Описание" error={errors.description}>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Кратко опишите деятельность компании"
        className={wizardTextareaClass}
      />
    </WizardField>

    <WizardField label="Логотип (URL)" error={errors.logo}>
      <input
        type="url"
        value={data.logo}
        onChange={(e) => onChange({ logo: e.target.value })}
        placeholder="https://example.com/logo.png"
        className={wizardInputClass}
      />
    </WizardField>
  </div>
)
