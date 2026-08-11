"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"
import type { IncomingMessage } from "@/lib/store/contracts-store"

type BuyerMessagesPanelProps = {
  messages: IncomingMessage[]
  hydrated: boolean
}

export const BuyerMessagesPanel = ({ messages, hydrated }: BuyerMessagesPanelProps) => (
  <div className="bg-card border border-border rounded-xl">
    <div className="p-5 border-b border-border">
      <h2 className="text-sm font-semibold text-foreground">Сообщения</h2>
    </div>

    {!hydrated || messages.length === 0 ? (
      <div className="p-8 text-center">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
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
            href={`/customer/contracts/${item.contract.id}`}
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
