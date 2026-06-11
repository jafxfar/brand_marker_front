export const categoryUrl = (slug: string, sub?: string) => {
  const base = `/categories/${slug}`
  if (!sub) return base
  return `${base}?sub=${encodeURIComponent(sub)}`
}

export const categoriesUrl = () => "/categories"

export const serviceUrl = (id: number | string) => `/services/${id}`

export const servicesUrl = (params?: { q?: string; category?: string }) => {
  const search = new URLSearchParams()
  if (params?.q) search.set("q", params.q)
  if (params?.category) search.set("category", params.category)
  const query = search.toString()
  return query ? `/services?${query}` : "/services"
}

export const performerUrl = (id: number | string) => `/performers/${id}`

export const performersUrl = (params?: {
  verified?: boolean
  featured?: boolean
  scope?: string
  q?: string
}) => {
  const search = new URLSearchParams()
  if (params?.verified) search.set("verified", "true")
  if (params?.featured) search.set("featured", "true")
  if (params?.scope) search.set("scope", params.scope)
  if (params?.q) search.set("q", params.q)
  const query = search.toString()
  return query ? `/performers?${query}` : "/performers"
}

export const guaranteeUrl = () => "/guarantee"

export const verificationUrl = () => "/verification"

export const ordersUrl = () => "/orders"

export const helpUrl = () => "/help"

export const loginRedirect = (path: string) =>
  `/login?redirect=${encodeURIComponent(path)}`

export const newRfqRedirect = () => loginRedirect("/customer/rfqs/new")

export const supplierRfqRedirect = () => loginRedirect("/supplier/rfqs")
