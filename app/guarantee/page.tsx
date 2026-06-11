import Link from "next/link"
import { CircleDollarSign, ShieldCheck } from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { newRfqRedirect } from "@/lib/marketplace-routes"

export default function GuaranteePage() {
  return (
    <PageShell>
      <section className="bg-background py-12">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
              <ShieldCheck size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">Гарантия сделки</h1>
              <p className="text-sm text-muted-foreground mt-1">Безопасные расчёты и защита интересов заказчика</p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 space-y-6">
            <div id="payment">
              <div className="flex items-center gap-2 mb-3">
                <CircleDollarSign size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">Безопасная оплата</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Средства резервируются на платформе и переводятся исполнителю только после того, как вы примете выполненную работу. Это снижает риски для обеих сторон сделки.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Как это работает</h2>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>Заказчик размещает заказ и выбирает исполнителя</li>
                <li>Оплата блокируется на счёте сделки</li>
                <li>Исполнитель выполняет работу и сдаёт результат</li>
                <li>После приёмки средства автоматически переводятся исполнителю</li>
              </ol>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Гарантия качества</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                При спорных ситуациях подключается служба арбитража платформы. Мы анализируем переписку, договорённости и результат работы, чтобы найти справедливое решение.
              </p>
            </div>

            <Link
              href={newRfqRedirect()}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
            >
              Разместить заказ
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
