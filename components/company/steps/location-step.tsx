"use client"

import type { CompanyWizardInput } from "@/types"
import { WizardField, wizardInputClass } from "@/components/company/wizard-field"

type LocationStepProps = {
  data: CompanyWizardInput
  errors: Record<string, string>
  onChange: (patch: Partial<CompanyWizardInput>) => void
}

export const LocationStep = ({ data, errors, onChange }: LocationStepProps) => (
  <div className="space-y-5">
    <WizardField label="Страна" error={errors.country}>
      <input
        maxLength={50}
        type="text"
        value={data.country}
        onChange={(e) => onChange({ country: e.target.value })}
        placeholder="Таджикистан"
        className={wizardInputClass}
      />
    </WizardField>

    <WizardField label="Город" required error={errors.city}>
      <input
        maxLength={50}
        type="text"
        value={data.city}
        onChange={(e) => onChange({ city: e.target.value })}
        placeholder="Душанбе"
        className={wizardInputClass}
      />
    </WizardField>

    <WizardField label="Адрес" error={errors.address}>
      <input
        maxLength={100}
        type="text"
        value={data.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="ул. Примерная, 1"
        className={wizardInputClass}
      />
    </WizardField>

    <WizardField label="Сайт" error={errors.website}>
      <input
        maxLength={200}
        type="url"
        value={data.website}
        onChange={(e) => onChange({ website: e.target.value })}
        placeholder="https://company.example"
        className={wizardInputClass}
      />
    </WizardField>
  </div>
)
