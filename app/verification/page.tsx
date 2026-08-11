import Link from "next/link"
import { BadgeCheck, FileCheck, Building2 } from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { performersUrl } from "@/lib/marketplace-routes"

export default function VerificationPage() {
  return (
    <PageShell>
      <section className="bg-background py-12">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
              <BadgeCheck size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">Верификация исполнителей</h1>
              <p className="text-sm text-muted-foreground mt-1">Проверенные юрлица и ИП на платформе</p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">Что мы проверяем</h2>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>— Регистрационные данные компании или ИП</li>
                <li>— Банковские реквизиты и контактные данные</li>
                <li>— Документы, подтверждающие право оказания услуг</li>
                <li>— Историю отзывов и репутацию на платформе</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileCheck size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">Значок верификации</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Исполнители с синим значком прошли проверку документов. Это не гарантирует идеальный результат каждой сделки, но подтверждает, что компания реальна и соответствует требованиям платформы.
              </p>
            </div>

            <Link
              href={performersUrl({ verified: true })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Смотреть верифицированных исполнителей
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
