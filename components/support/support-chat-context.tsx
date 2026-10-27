"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type SupportChatContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  openSupport: () => void
}

const SupportChatContext = createContext<SupportChatContextValue | null>(null)

export const SupportChatProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const openSupport = useCallback(() => setOpen(true), [])
  const value = useMemo(
    () => ({ open, setOpen, openSupport }),
    [open, openSupport],
  )
  return (
    <SupportChatContext.Provider value={value}>{children}</SupportChatContext.Provider>
  )
}

export const useSupportChat = (): SupportChatContextValue => {
  const ctx = useContext(SupportChatContext)
  if (!ctx) {
    return {
      open: false,
      setOpen: () => undefined,
      openSupport: () => undefined,
    }
  }
  return ctx
}
