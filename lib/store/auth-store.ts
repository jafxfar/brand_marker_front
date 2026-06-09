import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Role, User } from "@/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (params: { email: string; role: Role; name?: string }) => void
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const nameFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? "Пользователь"
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: ({ email, role, name }) =>
        set({
          isAuthenticated: true,
          user: {
            id: uid(),
            email,
            name: name?.trim() || nameFromEmail(email),
            role,
            hasDelivery: false,
            city: "Душанбе",
          },
        }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (patch) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...patch } } : state,
        ),
    }),
    { name: "bm-auth" },
  ),
)
