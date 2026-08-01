"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Briefcase, LockKeyhole, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useHydrated } from "@/hooks/use-hydrated"
import { getApiErrorMessage } from "@/lib/api/client"
import { isApiEnabled } from "@/lib/api/config"
import { useAuthStore } from "@/lib/store/auth-store"

const adminLoginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(4, "Минимум 4 символа"),
})

type AdminLoginValues = z.infer<typeof adminLoginSchema>

const adminRoles = new Set(["admin", "superadmin", "moderator"])

const AdminLoginContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useHydrated()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const loginAdminWithCredentials = useAuthStore(
    (state) => state.loginAdminWithCredentials,
  )
  const [apiError, setApiError] = useState<string | null>(null)
  const apiEnabled = isApiEnabled()
  const isAdmin =
    isAuthenticated &&
    user?.role === "admin" &&
    adminRoles.has(user.platformRole)
  const requestedRedirect = searchParams.get("redirect")
  const adminRedirect =
    requestedRedirect?.startsWith("/admin") &&
    !requestedRedirect.startsWith("/admin/login")
      ? requestedRedirect
      : "/admin"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (hydrated && isAdmin) {
      router.replace(adminRedirect)
    }
  }, [adminRedirect, hydrated, isAdmin, router])

  const handleLogin = async (values: AdminLoginValues) => {
    setApiError(null)
    if (!apiEnabled) {
      setApiError("Для входа администратора необходимо подключение к API")
      return
    }

    try {
      await loginAdminWithCredentials(values)
      router.replace(adminRedirect)
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Ошибка входа администратора"))
    }
  }

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(360px,0.85fr)_minmax(480px,1.15fr)]">
      <aside className="relative hidden overflow-hidden bg-[oklch(0.22_0.055_255)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="relative z-10 flex w-fit items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Briefcase size={17} className="text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-xl font-black tracking-tight">БрендМаркет</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-primary">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight">
            Управление платформой
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Защищённая зона для контроля пользователей, компаний, сделок и финансовых операций.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          Доступ только для сотрудников платформы
        </p>
        <ShieldCheck
          size={360}
          className="absolute -bottom-20 -right-20 text-white/[0.035]"
          aria-hidden="true"
        />
      </aside>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex w-fit items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Briefcase size={17} className="text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              БрендМаркет
            </span>
          </Link>

          <div className="mb-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary lg:hidden">
              <LockKeyhole size={21} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-foreground lg:mt-0">
              Вход администратора
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Используйте служебную учётную запись
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleLogin)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                placeholder="admin@company.ru"
                className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "admin-email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="admin-email-error" className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-foreground"
              >
                Пароль
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Введите пароль"
                className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "admin-password-error" : undefined}
                {...register("password")}
              />
              {errors.password && (
                <p id="admin-password-error" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {apiError && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-red-50 px-4 py-3 text-xs text-destructive"
              >
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !apiEnabled}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Проверка доступа..." : "Войти в панель"}
              {!isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Вход для заказчиков и поставщиков
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AdminLoginContent />
    </Suspense>
  )
}
