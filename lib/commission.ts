import type { PlatformSettingsInput } from "@/lib/api/public"

export const COMMISSION_CURRENCY = "TJS"

const roundMoney = (value: number) => Math.round(value * 100) / 100

const isCommissionCurrency = (currency: string) =>
  currency.toUpperCase() === COMMISSION_CURRENCY

export const calculateCommission = (
  amount: number,
  currency: string,
  settings: PlatformSettingsInput,
): number => {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  const minimum = isCommissionCurrency(currency) ? settings.commission_min : 0
  const commission = Math.max(minimum, (amount * settings.commission_percent) / 100)
  return roundMoney(Math.min(commission, amount))
}

export const exceedsContractLimit = (
  amount: number,
  currency: string,
  settings: Pick<PlatformSettingsInput, "max_contract_amount">,
): boolean =>
  settings.max_contract_amount != null
  && isCommissionCurrency(currency)
  && amount > settings.max_contract_amount
