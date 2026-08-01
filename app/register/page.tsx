"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Briefcase, ShoppingBag, Store, ArrowRight, ShieldCheck } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import type { MarketplaceSessionRole } from "@/lib/store/auth-store"
import { isApiEnabled } from "@/lib/api/config"
import { getApiErrorMessage } from "@/lib/api/client"

const schema = z
  .object({
    email: z.string().email("Введите корректный email"),
    password: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string().min(8, "Минимум 8 символов"),
    first_name: z.string().min(1, "Введите имя"),
    last_name: z.string().min(1, "Введите фамилию"),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

const roleCards: {
  role: MarketplaceSessionRole
  title: string
  desc: string
  Icon: typeof ShoppingBag
}[] = [
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

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-input bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registerWithCredentials = useAuthStore((s) => s.registerWithCredentials)
  const [role, setRole] = useState<MarketplaceSessionRole>("customer")
  const [apiError, setApiError] = useState<string | null>(null)
  const useApi = isApiEnabled()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      phone: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setApiError(null)
    try {
      await registerWithCredentials({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone?.trim() || undefined,
        role,
      })
      const redirect = searchParams.get("redirect")
      if (role === "customer") {
        router.push(redirect || "/customer")
        return
      }
      router.push(redirect || "/supplier")
    } catch (err) {
      setApiError(getApiErrorMessage(err, "Ошибка регистрации"))
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
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
            Создайте аккаунт<br />за пару минут
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-8">
            Зарегистрируйтесь по email, выберите роль и начните работать
            на маркетплейсе с защитой каждой сделки — деньги под защитой до приёмки.
          </p>
          <div className="flex items-center gap-2.5 text-sm text-white/80">
            <ShieldCheck size={18} className="text-primary" />
            Бесплатная регистрация для заказчиков и поставщиков
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-[0.06]">
          <Briefcase size={320} />
        </div>
        <div className="relative z-10 text-xs text-white/40 hidden lg:block">
          © 2024 БрендМаркет
        </div>
      </aside>

      <section className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <h2 className="text-2xl font-black text-foreground">Регистрация</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Создайте аккаунт по email и выберите роль
            </p>
          </div>

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
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-1.5">
                  Имя
                </label>
                <input
                  id="first_name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Иван"
                  className={inputClass}
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="text-xs text-destructive mt-1">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-foreground mb-1.5">
                  Фамилия
                </label>
                <input
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Иванов"
                  className={inputClass}
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="text-xs text-destructive mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.ru"
                className={inputClass}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                Телефон <span className="text-muted-foreground font-normal">(необязательно)</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+992 90 123 45 67"
                className={inputClass}
                {...register("phone")}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Минимум 8 символов"
                className={inputClass}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputClass}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              Зарегистрироваться как {role === "customer" ? "заказчик" : "поставщик"}
              <ArrowRight size={16} />
            </button>
            {apiError && (
              <p className="text-xs text-destructive text-center">{apiError}</p>
            )}
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            {useApi
              ? "Регистрация через API BrandMarket. После создания аккаунта вы сразу войдёте в систему."
              : "Демо-режим: данные сохраняются локально в браузере."}
          </p>
          <p className="text-sm text-center mt-4">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Войти
            </Link>
          </p>
          <p className="text-sm text-center mt-2">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              ← Вернуться на главную
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RegisterContent />
    </Suspense>
  )
}
