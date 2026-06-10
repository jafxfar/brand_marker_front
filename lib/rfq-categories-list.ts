import { rfqCategoryLabels } from "@/lib/mock/rfq-categories"

export const rfqCategories = Object.entries(rfqCategoryLabels).map(([id, label]) => ({
  id,
  label,
}))
