"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LANDING_FAQ_ITEMS } from "@/lib/landing-copy"

export const LandingFaq = () => (
  <section
    id="faq"
    className="scroll-mt-28 border-b border-border bg-card"
    aria-labelledby="faq-heading"
  >
    <div className="max-w-[1440px] mx-auto px-6 py-16 sm:py-20">
      <h2
        id="faq-heading"
        className="text-2xl sm:text-3xl font-black text-foreground"
      >
        Вопросы и ответы
      </h2>
      <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
        Коротко о регистрации, оплатах и работе на площадке.
      </p>

      <Accordion
        type="single"
        collapsible
        defaultValue={LANDING_FAQ_ITEMS[0]?.id}
        className="mt-10 max-w-3xl"
      >
        {LANDING_FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
)
