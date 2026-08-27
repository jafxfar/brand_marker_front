import { useAuthStore } from "@/lib/store/auth-store"
import { loginRedirect } from "@/lib/marketplace-routes"

export type CreateRfqQuery = {
  service?: string | number
  performer?: string | number
  supplierId?: string | number
}

const buildCreateRfqPath = (query?: CreateRfqQuery): string => {
  const params = new URLSearchParams()
  if (query?.service != null) params.set("service", String(query.service))
  if (query?.performer != null) params.set("performer", String(query.performer))
  if (query?.supplierId != null) params.set("supplierId", String(query.supplierId))
  const qs = params.toString()
  return qs ? `/customer/rfqs/new?${qs}` : "/customer/rfqs/new"
}

/**
 * Role-aware href for creating an RFQ.
 * Guests → login; customers → create form; suppliers → own cabinet (no auto role switch).
 */
export const createRfqHref = (query?: CreateRfqQuery): string => {
  const path = buildCreateRfqPath(query)
  const state = useAuthStore.getState()
  if (!state.isAuthenticated || !state.user) {
    return loginRedirect(path)
  }
  if (state.user.role === "supplier") {
    return "/supplier"
  }
  if (state.user.role === "customer") {
    return path
  }
  return loginRedirect(path)
}
