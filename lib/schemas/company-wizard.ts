import { z } from "zod"
import { COMPANY_ROLES } from "@/types/user"
import type { CompanyWizardInput } from "@/types"

export const WIZARD_STEPS = [
  "basic",
  "location",
  "profile",
  "certificates",
  "team",
  "review",
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]

const basicSchema = z.object({
  title: z.string().min(2, "Название — минимум 2 символа"),
  legal_name: z.string(),
  tax_number: z.string(),
  description: z.string(),
  logo: z.string(),
})

const locationSchema = z.object({
  country: z.string(),
  city: z.string().min(1, "Укажите город"),
  address: z.string(),
  website: z
    .string()
    .refine(
      (v) => !v || /^https?:\/\/.+/.test(v),
      "Введите корректный URL (https://...)",
    ),
})

const profileSchema = z.object({
  founded_year: z.string().refine((v) => {
    if (!v) return true
    const year = Number(v)
    const current = new Date().getFullYear()
    return year >= 1800 && year <= current
  }, "Год основания от 1800 до текущего"),
  employees_count: z.string(),
  annual_revenue_range: z.string(),
  languages: z.array(z.string()),
  industries: z.array(z.string()),
  category_ids: z.array(z.number()),
})

const certificateItemSchema = z.object({
  title: z.string().min(1, "Укажите название сертификата"),
  issuer: z.string().min(1, "Укажите орган выдачи"),
  issue_date: z.string().min(1, "Укажите дату выдачи"),
  expiry_date: z.string(),
  file_url: z.string().min(1, "Укажите ссылку на файл"),
})

const certificatesSchema = z.object({
  certificates: z.array(certificateItemSchema),
})

const teamMemberSchema = z.object({
  email: z.string().email("Некорректный email"),
  role: z.enum(COMPANY_ROLES),
})

const teamSchema = z.object({
  team: z.array(teamMemberSchema),
})

const stepSchemas: Record<Exclude<WizardStep, "review">, z.ZodType> = {
  basic: basicSchema,
  location: locationSchema,
  profile: profileSchema,
  certificates: certificatesSchema,
  team: teamSchema,
}

export const validateCompanyWizardStep = (
  step: WizardStep,
  data: CompanyWizardInput,
): Record<string, string> => {
  if (step === "review") return {}

  const schema = stepSchemas[step]
  const result = schema.safeParse(data)

  if (result.success) return {}

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join(".")
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

export const validateFullWizard = (
  data: CompanyWizardInput,
): Record<string, string> => {
  const steps: Exclude<WizardStep, "review">[] = [
    "basic",
    "location",
    "profile",
    "certificates",
    "team",
  ]
  const errors: Record<string, string> = {}
  for (const step of steps) {
    Object.assign(errors, validateCompanyWizardStep(step, data))
  }
  return errors
}
