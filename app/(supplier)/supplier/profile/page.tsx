"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Store, Truck, Check, LogOut, Building2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useHydrated } from "@/hooks/use-hydrated"

export default function SupplierProfilePage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const logout = useAuthStore((s) => s.logout)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [hasDelivery, setHasDelivery] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone ?? "")
      setCity(user.city ?? "")
      setHasDelivery(user.hasDelivery ?? false)
    }
  }, [user])

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    updateProfile({
      name: name.trim() || user?.name || "",
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      hasDelivery,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const inputClass =
    "w-full h-11 px-4 rounded-xl border border-input bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"

  if (!hydrated) return null

  return (
    <div className="max-w-[720px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Store size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Профиль поставщика</h1>
          <p className="text-sm text-muted-foreground">Контактные данные и настройки доставки</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Link
                href="/supplier/company"
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Building2 size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Мои компании</p>
                    <p className="text-xs text-muted-foreground">
                      Создание и управление профилем бренда
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Контактное лицо</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input id="email" value={email} disabled className={cn(inputClass, "bg-muted text-muted-foreground cursor-not-allowed")} />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">Телефон</label>
              <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 999 123-45-67" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1.5">Город</label>
              <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-bold text-foreground mb-1">Доставка</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Укажите, если вы организуете доставку товаров покупателям
          </p>
          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-border cursor-pointer hover:border-primary/40 transition-colors">
            <input
              type="checkbox"
              checked={hasDelivery}
              onChange={(e) => setHasDelivery(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <Truck size={18} className="text-primary" />
            <div>
              <div className="text-sm font-medium text-foreground">У меня есть доставка</div>
              <div className="text-[11px] text-muted-foreground">Доставляю товары своими силами или через службу</div>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="h-11 px-5 rounded-xl border border-border text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} /> Выйти
          </button>
          <button
            type="submit"
            className={cn(
              "h-11 px-6 rounded-xl text-white text-sm font-bold transition-colors flex items-center gap-2",
              saved ? "bg-emerald-600" : "bg-primary hover:bg-primary-dark",
            )}
          >
            {saved ? (
              <>
                <Check size={16} /> Сохранено
              </>
            ) : (
              "Сохранить изменения"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
