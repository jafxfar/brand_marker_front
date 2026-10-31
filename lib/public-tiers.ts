/** Marketing supplier tiers from BrendMarket-v7.1 (public site). */
export type PublicTier = {
  id: "free" | "pro" | "vip" | "premium"
  name: string
  price: number
  fee: number
  products: number | null
  leads: number | null
  staff: number | null
  search: string
  tag: string
  popular?: boolean
  colors: [string, string]
  fg: string
}

export const PUBLIC_TIERS: PublicTier[] = [
  {
    id: "free",
    name: "Базовый",
    price: 0,
    fee: 4,
    products: 20,
    leads: 10,
    staff: 1,
    search: "обычное",
    tag: "Для старта",
    colors: ["#EEF0F3", "#D9DDE3"],
    fg: "#16181D",
  },
  {
    id: "pro",
    name: "Pro",
    price: 490,
    fee: 3.5,
    products: 100,
    leads: 50,
    staff: 3,
    search: "выше обычных",
    tag: "Малый бизнес",
    colors: ["#3D74E6", "#2453C6"],
    fg: "#FFFFFF",
  },
  {
    id: "vip",
    name: "VIP",
    price: 1490,
    fee: 3,
    products: 500,
    leads: 200,
    staff: 10,
    search: "выше + метка",
    tag: "Чаще выбирают",
    popular: true,
    colors: ["#F7D774", "#D9A033"],
    fg: "#3D2800",
  },
  {
    id: "premium",
    name: "Premium",
    price: 3900,
    fee: 2.5,
    products: null,
    leads: null,
    staff: null,
    search: "первые места",
    tag: "Крупные поставщики",
    colors: ["#343A44", "#0E0F12"],
    fg: "#F2CF6B",
  },
]

export const formatTierPrice = (price: number) =>
  price === 0 ? "0 TJS" : `${price.toLocaleString("ru-RU")} TJS`
