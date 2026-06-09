"use client"

import Link from "next/link"
import { MessageSquare, ArrowRight } from "lucide-react"
import type { IncomingMessage } from "@/lib/store/contracts-store"

type IncomingMessagesPanelProps = {
  messages: IncomingMessage[]
  hydrated: boolean
}

export const IncomingMessagesPanel = ({
  messages,
  hydrated,
}: IncomingMessagesPanelProps) => (
  <div className="bg-white border border-border rounded-2xl">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h2 className="text-base font-bold text-foreground">Входящие сообщения</h2>
      <Link
        href="/supplier/messages"
        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
      >
        Все <ArrowRight size={14} />
      </Link>
    </div>

    {!hydrated || messages.length === 0 ? (
      <div className="p-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <MessageSquare size={18} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Сообщений нет</p>
        <p className="text-xs text-muted-foreground mt-1">
          Переписка по контрактам появится здесь
        </p>
      </div>
    ) : (
      <div className="divide-y divide-border">
        {messages.slice(0, 5).map((item) => (
          <Link
            key={`${item.contract.id}-${item.message.id}`}
            href="/supplier/messages"
            className="block p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {item.senderName}
              </p>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {item.contract.title}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.message.text}</p>
          </Link>
        ))}
      </div>
    )}
  </div>
)
