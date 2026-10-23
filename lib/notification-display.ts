import {
  FileCheck, FileText, Headphones, Info, ScrollText, Users, Wallet, type LucideIcon,
} from "lucide-react"
import type { NotificationType } from "@/types/notification"

export const notificationTypeIcon: Record<NotificationType, LucideIcon> = {
  order: FileText,
  offer: Users,
  payment: Wallet,
  system: Info,
  rfq: ScrollText,
  contract: FileCheck,
  proposal: Users,
  support: Headphones,
}

export const getNotificationIcon = (type: NotificationType | string): LucideIcon =>
  notificationTypeIcon[type as NotificationType] ?? Info
