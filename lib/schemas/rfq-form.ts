import { z } from "zod"

const baseSchema = z.object({
  type: z.enum(["product", "service"]),
  title: z.string().min(5, "Заголовок не короче 5 символов"),
  category_id: z.string().min(1, "Выберите категорию"),
  description: z.string().min(10, "Описание от 10 символов"),
  budget_type: z.enum(["fixed", "range", "open"]),
  budget_from: z.string().optional(),
  budget_to: z.string().optional(),
  currency: z.enum(["TJS", "USD", "EUR", "KZT", "CNY"]),
  deadline: z.string().min(1, "Укажите дедлайн"),
  visibility: z.enum(["public", "invited_only"]).default("public"),
})

const productSchema = baseSchema.extend({
  type: z.literal("product"),
  quantity: z.string().min(1, "Укажите количество"),
  delivery_country: z.string().min(1, "Укажите страну"),
  delivery_city: z.string().min(1, "Укажите город"),
  delivery_address: z.string().optional(),
  delivery_date: z.string().min(1, "Укажите дату поставки"),
})

const serviceSchema = baseSchema.extend({
  type: z.literal("service"),
  project_duration: z.string().min(1, "Укажите длительность"),
  start_date: z.string().min(1, "Укажите дату начала"),
  team_size_required: z.string().optional(),
  experience_required: z.string().optional(),
})

export const rfqFormSchema = z.discriminatedUnion("type", [productSchema, serviceSchema])

export type RfqFormValues = z.infer<typeof rfqFormSchema>

export const validateRfqForm = (values: RfqFormValues): Record<string, string> => {
  const result = rfqFormSchema.safeParse(values)
  if (result.success) {
    const errors: Record<string, string> = {}
    if (values.budget_type === "fixed") {
      const from = Number(values.budget_from)
      if (!values.budget_from || Number.isNaN(from) || from <= 0) {
        errors.budget_from = "Укажите бюджет"
      }
    }
    if (values.budget_type === "range") {
      const from = Number(values.budget_from)
      const to = Number(values.budget_to)
      if (!values.budget_from || Number.isNaN(from) || from <= 0) {
        errors.budget_from = "Укажите минимум"
      }
      if (!values.budget_to || Number.isNaN(to) || to <= from) {
        errors.budget_to = "Максимум должен быть больше минимума"
      }
    }
    if (values.type === "product") {
      const qty = Number(values.quantity)
      if (Number.isNaN(qty) || qty < 1) errors.quantity = "Количество от 1"
    }
    return errors
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form")
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}
