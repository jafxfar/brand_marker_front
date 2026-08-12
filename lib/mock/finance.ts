import type {
  Invoice,
  Withdrawal,
  WithdrawalDestination,
} from "@/types"
import { DEMO_SUPPLIER_ACTOR_ID } from "@/lib/mock/companies"

const daysAgo = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

const daysFromNow = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]!
}

export const mockWithdrawalDestinations: WithdrawalDestination[] = [
  {
    id: 1,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    type: "bank",
    label: "Сбербанк ·••• 4521",
    details: "БИК 044525225 · р/с ·••• 8901",
    is_default: true,
  },
  {
    id: 2,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    type: "wallet",
    label: "USDT (TRC-20)",
    details: "TX9k…4mP2",
    is_default: false,
  },
]

export const mockWithdrawals: Withdrawal[] = [
  {
    id: 1,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    destination_id: 1,
    amount: 500000,
    currency: "TJS",
    status: "completed",
    created_at: daysAgo(30),
    completed_at: daysAgo(28),
  },
  {
    id: 2,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    destination_id: 1,
    amount: 350000,
    currency: "TJS",
    status: "completed",
    created_at: daysAgo(14),
    completed_at: daysAgo(12),
  },
  {
    id: 3,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    destination_id: 2,
    amount: 200000,
    currency: "TJS",
    status: "processing",
    created_at: daysAgo(3),
    completed_at: null,
  },
  {
    id: 4,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    destination_id: 1,
    amount: 150000,
    currency: "TJS",
    status: "pending",
    created_at: daysAgo(1),
    completed_at: null,
  },
]

export const mockInvoices: Invoice[] = [
  {
    id: 1,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    contract_id: 1001,
    number: "INV-2026-0042",
    title: "Аванс 30% — Поставка рабочих станций HP",
    amount: 675000,
    currency: "TJS",
    status: "paid",
    issued_at: daysAgo(45),
    due_at: daysAgo(40),
    paid_at: daysAgo(44),
  },
  {
    id: 2,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    contract_id: 1002,
    number: "INV-2026-0058",
    title: "Предоплата 50% — Интеграция ERP",
    amount: 1600000,
    currency: "TJS",
    status: "paid",
    issued_at: daysAgo(20),
    due_at: daysAgo(15),
    paid_at: daysAgo(18),
  },
  {
    id: 3,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    contract_id: 1001,
    number: "INV-2026-0091",
    title: "Поставка оборудования — этап 2",
    amount: 1125000,
    currency: "TJS",
    status: "issued",
    issued_at: daysAgo(5),
    due_at: daysFromNow(10),
    paid_at: null,
  },
  {
    id: 4,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    contract_id: 1004,
    number: "INV-2026-0103",
    title: "Старт проекта — Внедрение CRM",
    amount: 220000,
    currency: "TJS",
    status: "overdue",
    issued_at: daysAgo(7),
    due_at: daysAgo(2),
    paid_at: null,
  },
  {
    id: 5,
    actor_id: DEMO_SUPPLIER_ACTOR_ID,
    contract_id: 1005,
    number: "INV-2025-0188",
    title: "Оплата по завершении — Обслуживание серверной",
    amount: 480000,
    currency: "TJS",
    status: "paid",
    issued_at: daysAgo(12),
    due_at: daysAgo(10),
    paid_at: daysAgo(11),
  },
]
