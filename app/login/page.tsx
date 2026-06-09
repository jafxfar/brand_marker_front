"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Briefcase, ShoppingBag, Store, ArrowRight, ShieldCheck } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import type { Role } from "@/types"

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(4, "Минимум 4 символа"),
})

type FormValues = z.infer<typeof schema>

const roleCards: { role: Role; title: string; desc: string; Icon: typeof ShoppingBag }[] = [
  {
    role: "customer",
    title: "Я заказчик",
    desc: "Размещаю заказы и покупаю товары/услуги",
    Icon: ShoppingBag,
  },
  {
    role: "supplier",
    title: "Я поставщик",
    desc: "Предлагаю товары и услуги, откликаюсь на заказы",
    Icon: Store,
  },
]

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const [role, setRole] = useState<Role>("customer")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: FormValues) => {
    login({ email: values.email, role })
    const redirect = searchParams.get("redirect")
    if (role === "customer") {
      router.push(redirect || "/customer")
      return
    }
    router.push(redirect || "/supplier")
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <aside
        className="lg:w-[42%] relative overflow-hidden p-10 lg:p-14 flex flex-col justify-between text-white"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.055 255) 0%, oklch(0.3 0.09 255) 100%)" }}
      >
        <Link href="/" className="flex items-center gap-2.5 relative z-10 w-fit">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Briefcase size={17} className="text-white" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black text-primary">Бренд</span>
            <span className="text-xl font-black text-white">Маркет</span>
          </div>
        </Link>

        <div className="relative z-10 hidden lg:block">
          <h1 className="text-3xl font-black leading-tight mb-4">
            B2B маркетплейс<br />товаров и услуг
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-8">
            Размещайте заказы, получайте отклики проверенных поставщиков и платите
            безопасно через эскроу — деньги переводятся только после приёмки работы.
          </p>
          <div className="flex items-center gap-2.5 text-sm text-white/80">
            <ShieldCheck size={18} className="text-orange-300" />
            Гарантия сделки и защита платежей
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-[0.06]">
          <Briefcase size={320} />
        </div>
        <div className="relative z-10 text-xs text-white/40 hidden lg:block">
          © 2024 БрендМаркет
        </div>
      </aside>

      {/* Right form panel */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <h2 className="text-2xl font-black text-foreground">Вход в систему</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Выберите роль и войдите в личный кабинет
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roleCards.map(({ role: r, title, desc, Icon }) => {
              const active = role === r
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={active}
                  className={`text-left rounded-2xl border-2 p-4 transition-all ${
                    active
                      ? "border-primary bg-secondary shadow-sm"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${
                      active ? "bg-primary text-white" : "bg-secondary text-primary"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="text-sm font-bold text-foreground">{title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{desc}</div>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.ru"
                className="w-full h-11 px-4 rounded-xl border border-input bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-xl border border-input bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              Войти как {role === "customer" ? "заказчик" : "поставщик"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Это демо-вход: данные не проверяются и хранятся локально в браузере.
          </p>
          <p className="text-sm text-center mt-4">
            <Link href="/" className="text-primary font-semibold hover:underline">
              ← Вернуться на главную
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginContent />
    </Suspense>
  )
}
