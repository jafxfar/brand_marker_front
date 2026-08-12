"use client"

import { useMemo, useState } from "react"
import { MessageSquare, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  filterChatConversations,
  type ChatConversationItem,
} from "@/lib/chat-conversations"
import { formatRelativeIso } from "@/lib/format"

type ConversationsSidebarProps = {
  conversations: ChatConversationItem[]
  selectedId: number | null
  onSelect: (contractId: number) => void
  searchPlaceholder?: string
}

export const ConversationsSidebar = ({
  conversations,
  selectedId,
  onSelect,
  searchPlaceholder = "Поиск по чатам...",
}: ConversationsSidebarProps) => {
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () => filterChatConversations(conversations, query),
    [conversations, query],
  )

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[420px]">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Поиск по чатам"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {query.trim() ? "Ничего не найдено" : "Диалогов пока нет"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => {
              const isSelected = selectedId === item.contract.id
              const hasUnread = item.unreadCount > 0
              const timeLabel = item.lastMessage.created_at
                ? formatRelativeIso(item.lastMessage.created_at)
                : null

              return (
                <button
                  key={item.contract.id}
                  type="button"
                  onClick={() => onSelect(item.contract.id)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-secondary/50 transition-colors",
                    isSelected && "bg-secondary",
                  )}
                  aria-label={`Открыть переписку по контракту ${item.contract.title}`}
                  aria-current={isSelected ? "true" : undefined}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-sm truncate flex-1",
                            hasUnread
                              ? "font-bold text-foreground"
                              : "font-semibold text-foreground",
                          )}
                        >
                          {item.contract.title}
                        </p>
                        {timeLabel && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {timeLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.counterpartName}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-1 truncate",
                          hasUnread
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.senderName}: {item.lastMessage.text}
                      </p>
                    </div>
                    {hasUnread && (
                      <span
                        className="mt-0.5 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                        aria-label={`Непрочитанных: ${item.unreadCount}`}
                      >
                        {item.unreadCount > 99 ? "99+" : item.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
