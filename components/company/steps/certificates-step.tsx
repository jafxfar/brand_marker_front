"use client"

import { Plus, Trash2 } from "lucide-react"
import type { CompanyWizardCertificate, CompanyWizardInput } from "@/types"
import { WizardField, wizardInputClass } from "@/components/company/wizard-field"

const emptyCertificate = (): CompanyWizardCertificate => ({
  title: "",
  issuer: "",
  issue_date: "",
  expiry_date: "",
  file_url: "",
})

type CertificatesStepProps = {
  data: CompanyWizardInput
  errors: Record<string, string>
  onChange: (patch: Partial<CompanyWizardInput>) => void
}

export const CertificatesStep = ({
  data,
  errors,
  onChange,
}: CertificatesStepProps) => {
  const handleAdd = () => {
    onChange({ certificates: [...data.certificates, emptyCertificate()] })
  }

  const handleRemove = (index: number) => {
    onChange({
      certificates: data.certificates.filter((_, i) => i !== index),
    })
  }

  const handleUpdate = (
    index: number,
    patch: Partial<CompanyWizardCertificate>,
  ) => {
    onChange({
      certificates: data.certificates.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      ),
    })
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Сертификаты необязательны. Добавьте документы о качестве, лицензии и
        стандартах.
      </p>

      {data.certificates.length === 0 && (
        <div className="rounded-xl border border-dashed border-input p-8 text-center text-sm text-muted-foreground">
          Сертификаты не добавлены
        </div>
      )}

      {data.certificates.map((cert, index) => (
        <div
          key={index}
          className="rounded-xl border border-border p-4 space-y-4 bg-secondary/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Сертификат {index + 1}</span>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              aria-label="Удалить сертификат"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <WizardField
            label="Название"
            error={errors[`certificates.${index}.title`]}
          >
            <input
              type="text"
              value={cert.title}
              onChange={(e) => handleUpdate(index, { title: e.target.value })}
              className={wizardInputClass}
            />
          </WizardField>

          <WizardField
            label="Орган выдачи"
            error={errors[`certificates.${index}.issuer`]}
          >
            <input
              type="text"
              value={cert.issuer}
              onChange={(e) => handleUpdate(index, { issuer: e.target.value })}
              className={wizardInputClass}
            />
          </WizardField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WizardField
              label="Дата выдачи"
              error={errors[`certificates.${index}.issue_date`]}
            >
              <input
                type="date"
                value={cert.issue_date}
                onChange={(e) =>
                  handleUpdate(index, { issue_date: e.target.value })
                }
                className={wizardInputClass}
              />
            </WizardField>

            <WizardField label="Срок действия">
              <input
                type="date"
                value={cert.expiry_date}
                onChange={(e) =>
                  handleUpdate(index, { expiry_date: e.target.value })
                }
                className={wizardInputClass}
              />
            </WizardField>
          </div>

          <WizardField
            label="Ссылка на файл"
            error={errors[`certificates.${index}.file_url`]}
          >
            <input
              type="url"
              value={cert.file_url}
              onChange={(e) => handleUpdate(index, { file_url: e.target.value })}
              placeholder="https://..."
              className={wizardInputClass}
            />
          </WizardField>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 h-11 px-4 rounded-xl border border-dashed border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
      >
        <Plus size={16} />
        Добавить сертификат
      </button>
    </div>
  )
}
