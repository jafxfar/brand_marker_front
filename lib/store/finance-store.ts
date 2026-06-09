import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Invoice,
  SupplierBalanceSummary,
  Withdrawal,
  WithdrawalDestination,
} from "@/types"
import {
  mockInvoices,
  mockWithdrawalDestinations,
  mockWithdrawals,
} from "@/lib/mock/finance"
import { getSupplierBalances } from "@/lib/finance-display"
import { useContractsStore } from "@/lib/store/contracts-store"

type RequestWithdrawalInput = {
  destinationId: number
  amount: number
}

type RequestWithdrawalResult =
  | { ok: true }
  | { ok: false; error: string }

interface FinanceState {
  destinations: WithdrawalDestination[]
  withdrawals: Withdrawal[]
  invoices: Invoice[]
  getDestinations: (actorId: number) => WithdrawalDestination[]
  getWithdrawals: (actorId: number) => Withdrawal[]
  getInvoices: (actorId: number) => Invoice[]
  getBalanceSummary: (actorId: number) => SupplierBalanceSummary
  requestWithdrawal: (
    actorId: number,
    input: RequestWithdrawalInput,
  ) => RequestWithdrawalResult
}

const nextWithdrawalId = (withdrawals: Withdrawal[]): number => {
  const maxId = withdrawals.reduce((max, w) => Math.max(max, w.id), 0)
  return maxId + 1
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      destinations: mockWithdrawalDestinations,
      withdrawals: mockWithdrawals,
      invoices: mockInvoices,

      getDestinations: (actorId) =>
        get().destinations.filter((d) => d.actor_id === actorId),

      getWithdrawals: (actorId) =>
        get()
          .withdrawals.filter((w) => w.actor_id === actorId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),

      getInvoices: (actorId) =>
        get()
          .invoices.filter((i) => i.actor_id === actorId)
          .sort(
            (a, b) =>
              new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime(),
          ),

      getBalanceSummary: (actorId) => {
        const contracts = useContractsStore.getState().contracts
        return getSupplierBalances(actorId, contracts, get().withdrawals)
      },

      requestWithdrawal: (actorId, input) => {
        const destination = get().destinations.find(
          (d) => d.id === input.destinationId && d.actor_id === actorId,
        )
        if (!destination) {
          return { ok: false, error: "Счёт или кошелёк не найден" }
        }

        if (input.amount <= 0) {
          return { ok: false, error: "Укажите сумму больше нуля" }
        }

        const contracts = useContractsStore.getState().contracts
        const balances = getSupplierBalances(actorId, contracts, get().withdrawals)

        if (input.amount > balances.available) {
          return { ok: false, error: "Недостаточно средств на доступном балансе" }
        }

        const withdrawal: Withdrawal = {
          id: nextWithdrawalId(get().withdrawals),
          actor_id: actorId,
          destination_id: input.destinationId,
          amount: input.amount,
          currency: balances.currency,
          status: "pending",
          created_at: new Date().toISOString(),
          completed_at: null,
        }

        set((state) => ({
          withdrawals: [withdrawal, ...state.withdrawals],
        }))

        return { ok: true }
      },
    }),
    { name: "bm-finance" },
  ),
)
