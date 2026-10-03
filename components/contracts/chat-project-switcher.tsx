"use client"

import { useRef, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import type { ChatConversationItem } from "@/lib/chat-conversations"

type ChatProjectSwitcherProps = {
  projects: ChatConversationItem[]
  selectedContractId: number | null
  onSelect: (contractId: number) => void
}

export const ChatProjectSwitcher = ({
  projects,
  selectedContractId,
  onSelect,
}: ChatProjectSwitcherProps) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  if (projects.length <= 1) return null

  const selectedIndex = Math.max(
    0,
    projects.findIndex((project) => project.contract.id === selectedContractId),
  )

  const focusProject = (index: number) => {
    const project = projects[index]
    if (!project) return
    onSelect(project.contract.id)
    tabRefs.current[index]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      focusProject((selectedIndex + 1) % projects.length)
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      focusProject((selectedIndex - 1 + projects.length) % projects.length)
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      focusProject(0)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      focusProject(projects.length - 1)
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Проекты с этим контрагентом"
      onKeyDown={handleKeyDown}
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {projects.map((project, index) => {
        const isSelected = index === selectedIndex
        const hasUnread = project.unreadCount > 0

        return (
          <button
            key={project.contract.id}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(project.contract.id)}
            title={project.contract.title}
            className={cn(
              "inline-flex items-center gap-2 shrink-0 max-w-65 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary",
            )}
          >
            <span className="truncate">{project.contract.title}</span>
            {hasUnread && (
              <span
                className={cn(
                  "min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center",
                  isSelected
                    ? "bg-primary-foreground text-primary"
                    : "bg-primary text-primary-foreground",
                )}
                aria-label={`Непрочитанных: ${project.unreadCount}`}
              >
                {project.unreadCount > 99 ? "99+" : project.unreadCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
