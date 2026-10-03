import { cn } from "@/lib/utils"

const STEPS = [
  { title: "Выбираете исполнителя", text: "По цене, срокам и отзывам" },
  { title: "Исполнитель работает", text: "Вы видите этап сделки и переписку" },
  { title: "Принимаете работу", text: "Проверяете результат перед оплатой" },
  { title: "Деньги уходят исполнителю", text: "Только после вашей приёмки" },
] as const

export const EscrowExplainer = ({ className }: { className?: string }) => (
  <section
    className={cn("grid gap-4 rounded-2xl bg-brand-900 p-5 text-white md:p-6", className)}
    aria-labelledby="escrow-explainer-title"
  >
    <div>
      <h2 id="escrow-explainer-title" className="text-lg font-bold">
        Как защищены ваши деньги
      </h2>
      <p className="mt-1 text-sm text-white/70">
        Каждая сделка проходит четыре шага. Вы платите не исполнителю напрямую, а через площадку.
      </p>
    </div>
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, index) => (
        <li key={step.title} className="rounded-xl bg-white/10 p-3.5">
          <span className="text-sm font-bold text-brand-300">Шаг {index + 1}</span>
          <p className="mt-1 font-bold">{step.title}</p>
          <p className="text-sm text-white/70">{step.text}</p>
        </li>
      ))}
    </ol>
  </section>
)
