"use client"

import { useState, type KeyboardEvent } from "react"
import { Send } from "lucide-react"
import type { ContractWithRelations } from "@/types"

type ContractMessagesPanelProps = {
  contract: ContractWithRelations
  currentSenderId: number
  getSenderName: (senderId: number) => string
  onSendMessage: (text: string) => void
}

export const ContractMessagesPanel = ({
  contract,
  currentSenderId,
  getSenderName,
  onSendMessage,
}: ContractMessagesPanelProps) => {
  const [text, setText] = useState("")
  const messages = contract.conversation?.messages ?? []

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setText("")
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <section className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">Сообщения</h2>

      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">Сообщений пока нет</p>
      ) : (
        <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
          {messages.map((message) => {
            const isOwn = message.sender_id === currentSenderId
            return (
              <div
                key={message.id}
                className={`rounded-xl p-3 ${isOwn ? "bg-primary/5 border border-primary/10" : "bg-secondary"}`}
              >
                <p className="text-xs font-semibold text-foreground mb-1">
                  {getSenderName(message.sender_id)}
                </p>
                <p className="text-sm text-muted-foreground">{message.text}</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Написать сообщение..."
          aria-label="Текст сообщения"
          className="flex-1 px-4 py-3 rounded-xl border border-input bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="h-auto px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          aria-label="Отправить сообщение"
        >
          <Send size={18} />
        </button>
      </div>
    </section>
  )
}
