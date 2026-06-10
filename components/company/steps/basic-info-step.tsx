"use client"

import type { CompanyWizardInput } from "@/types"
import { WizardField, wizardInputClass, wizardTextareaClass } from "@/components/company/wizard-field"

type BasicInfoStepProps = {
  data: CompanyWizardInput
  errors: Record<string, string>
  onChange: (patch: Partial<CompanyWizardInput>) => void
}

export const BasicInfoStep = ({ data, errors, onChange }: BasicInfoStepProps) => (
  <div className="space-y-5">
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
