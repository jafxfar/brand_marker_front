import { hasPermission } from "@/lib/admin-permissions"
import { useAuthStore } from "@/lib/store/auth-store"

export const useAdminPermission = (permission: string): boolean =>
  useAuthStore((state) => hasPermission(state.user, permission))
