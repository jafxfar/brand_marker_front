export const rfqCategoryLabels: Record<string, string> = {
  "cat-it": "ИТ и оборудование",
  "cat-dev": "Разработка ПО",
  "cat-med": "Медицина и фарма",
  "cat-security": "Информационная безопасность",
  "cat-crm": "CRM и автоматизация",
}

export const getRfqCategoryLabel = (id: string): string =>
  rfqCategoryLabels[id] ?? id
