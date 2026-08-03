import { apiFetch } from "@/lib/api/client"

export type AdminDashboardMetrics = {
  total_users: number
  total_companies: number
  catalog_items: number
  active_rfqs: number
  active_contracts: number
  escrow_balance: number
  open_disputes: number
  monthly_revenue: number
  pending_verifications: number
}

export type AdminActivityType =
  | "registration"
  | "contract"
  | "payment"
  | "dispute"

export type AdminActivityItem = {
  id: string
  type: AdminActivityType
  title: string
  description: string
  happened_at: string
}

export type AdminDashboardResponse = {
  metrics: AdminDashboardMetrics
  recent_activity: AdminActivityItem[]
}

export type AdminUserStatus = "pending" | "active" | "blocked"

export type AdminUserRole =
  | "buyer"
  | "supplier"
  | "both"
  | "admin"
  | "superadmin"
  | "moderator"

export type AdminUser = {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: AdminUserRole
  status: AdminUserStatus
  created_at: string
  updated_at: string
}

export type AdminUserStatusFilter = AdminUserStatus | "all"

export type AdminUserStatusCounts = Record<AdminUserStatusFilter, number>

export type AdminUsersResponse = {
  items: AdminUser[]
  total: number
  page: number
  page_size: number
  pages: number
  status_counts: AdminUserStatusCounts
}

export type AdminUsersParams = {
  page: number
  pageSize: number
  status: AdminUserStatusFilter
  query: string
}

export type AdminCompanyVerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "needs_documents"

export type AdminCompanyOperationalStatus = "active" | "blocked" | "deactivated"
export type AdminCompanyStatusFilter =
  | "all"
  | "verified"
  | "pending"
  | "rejected"
  | "blocked"
export type AdminCompanyAction =
  | "approve"
  | "reject"
  | "request_documents"
  | "block"
  | "deactivate"
  | "reactivate"

export type AdminCompanyOwner = {
  id: number
  email: string
  name: string
}

export type AdminCompany = {
  id: number
  title: string
  actor_type: "buyer" | "supplier"
  actor_types: Array<"buyer" | "supplier">
  owner: AdminCompanyOwner
  legal_name: string | null
  tax_number: string | null
  logo: string | null
  country: string | null
  city: string | null
  verification_status: AdminCompanyVerificationStatus
  operational_status: AdminCompanyOperationalStatus
  rating: number
  created_at: string
}

export type AdminCompaniesParams = {
  page: number
  pageSize: number
  status: AdminCompanyStatusFilter
  query: string
}

export type AdminCompaniesResponse = {
  items: AdminCompany[]
  total: number
  page: number
  page_size: number
  pages: number
  status_counts: Record<AdminCompanyStatusFilter, number>
}

export type AdminCompanyCatalogItem = {
  id: number
  title: string
  status: string
  category: string | null
  price: number | null
  currency: string | null
  views: number
  leads: number
  created_at: string
}

export type AdminCompanyDetail = AdminCompany & {
  website: string | null
  description: string | null
  address: string | null
  updated_at: string
  profile: {
    founded_year: number | null
    employees_count: number | null
    annual_revenue_range: string | null
    languages: string[]
    industries: string[]
  } | null
  stats: {
    completed_contracts: number
    active_contracts: number
    disputes_count: number
    average_rating: number
  } | null
  members: Array<{
    id: number
    user_id: number
    role: string
    email: string
    name: string
    status: string
  }>
  certificates: Array<{
    id: number
    title: string
    issuer: string
    issue_date: string
    expiry_date: string | null
    file_url: string
  }>
  products: AdminCompanyCatalogItem[]
  services: AdminCompanyCatalogItem[]
  contracts: Array<{
    id: number
    title: string
    status: string
    agreed_amount: number
    currency: string
    buyer_actor_id: number
    supplier_actor_id: number
    created_at: string
  }>
  reviews: Array<{
    id: number
    contract_id: number
    reviewer_actor_id: number
    rating: number
    comment: string | null
    created_at: string
  }>
  verification_checklist: Record<
    "legal_name" | "tax_number" | "address" | "website" | "certificates",
    boolean
  >
}

export type AdminCompanyActionResponse = {
  id: number
  action: AdminCompanyAction
  verification_status: AdminCompanyVerificationStatus
  operational_status: AdminCompanyOperationalStatus
}

export type AdminCatalogView =
  | "all"
  | "products"
  | "services"
  | "draft"
  | "reported"
  | "hidden"

export type AdminCatalogAction =
  | "approve"
  | "hide"
  | "request_changes"
  | "delete"

export type AdminCatalogOwner = {
  actor_id: number
  actor_kind: string
  display_name: string
  company_id: number | null
  company_title: string | null
  user_id: number | null
  email: string | null
  name: string
}

export type AdminCatalogItem = {
  id: number
  title: string
  type: "product" | "service"
  status: string
  category_name: string | null
  preview_url: string | null
  open_reports_count: number
  owner: AdminCatalogOwner | null
  created_at: string
  views: number
  leads: number
}

export type AdminCatalogParams = {
  page: number
  pageSize: number
  view: AdminCatalogView
  query: string
}

export type AdminCatalogListResponse = {
  items: AdminCatalogItem[]
  total: number
  page: number
  page_size: number
  pages: number
  view_counts: Record<AdminCatalogView, number>
}

export type AdminCatalogDetail = AdminCatalogItem & {
  description: string | null
  updated_at: string
  category: { id: number; name: string; slug: string } | null
  attributes: Array<{
    id: number
    name: string
    value: string
    value_type: string
    sort_order: number
  }>
  pricing: {
    pricing_type: string
    currency: string
    fixed_price: number | null
    hourly_rate: number | null
    monthly_rate: number | null
    tiers: Array<{ min_qty: number; price: number }>
  } | null
  media: Array<{
    id: number
    file_name: string
    file_url: string
    media_type: string
    sort_order: number
  }>
  stats: { views: number; leads: number }
  reports: Array<{
    id: number
    reason: string
    details: string | null
    status: string
    created_at: string
    resolved_at: string | null
    reporter: { id: number; email: string; name: string }
  }>
  history: Array<{
    id: number
    action: string
    details: Record<string, unknown>
    created_at: string
    actor: { id: number; email: string; name: string } | null
  }>
}

export type AdminCatalogActionResponse = {
  id: number
  action: AdminCatalogAction
  status: string
}

export type AdminParty = {
  actor_id: number
  actor_kind: string
  display_name: string
  company_id: number | null
  company_title: string | null
  user_id: number | null
  email: string | null
  name: string
}

export type AdminRfqView =
  | "published"
  | "closed"
  | "draft"
  | "reported"
  | "archived"

export type AdminRfqAction = "hide" | "close" | "delete" | "warn_buyer"

export type AdminRfq = {
  id: string
  title: string
  type: "product" | "service"
  status: string
  category_id: string
  currency: string
  budget_from: number | null
  budget_to: number | null
  deadline: string
  proposals_count: number
  open_reports_count: number
  buyer: AdminParty | null
  created_at: string
  updated_at: string
}

export type AdminRfqParams = {
  page: number
  pageSize: number
  view: AdminRfqView
  query: string
}

export type AdminRfqListResponse = {
  items: AdminRfq[]
  total: number
  page: number
  page_size: number
  pages: number
  view_counts: Record<AdminRfqView, number>
}

export type AdminRfqDetail = AdminRfq & {
  description: string | null
  requirements: {
    type: string
    category_id: string
    budget_type: string
    budget_from: number | null
    budget_to: number | null
    currency: string
    deadline: string
    visibility: string
    quantity: number | null
    delivery_country: string | null
    delivery_city: string | null
    delivery_address: string | null
    delivery_date: string | null
    project_duration: string | null
    start_date: string | null
    team_size_required: number | null
    experience_required: string | null
    attachments: Array<{
      id: string
      file_name: string
      file_url: string
      file_type: string
    }>
  }
  buyer: AdminParty | null
  proposals: Array<{
    id: number
    supplier_actor_id: number
    supplier: AdminParty | null
    price: number
    currency: string
    delivery_time: string | null
    message: string | null
    status: string
    created_at: string
    has_attachment: boolean
  }>
  messages: Array<{
    id: string
    source: string
    proposal_id?: number | null
    contract_id?: number | null
    sender_name: string
    text: string
    created_at: string
  }>
  reports: Array<{
    id: number
    reason: string
    details: string | null
    status: string
    created_at: string
    resolved_at: string | null
    reporter: { id: number; email: string; name: string }
  }>
  history: Array<{
    id: number
    action: string
    details: Record<string, unknown>
    created_at: string
    actor: { id: number; email: string; name: string } | null
  }>
}

export type AdminRfqActionResponse = {
  id: string
  action: AdminRfqAction
  status: string
}

export type AdminProposalView =
  | "all"
  | "pending"
  | "accepted"
  | "rejected"
  | "reported"

export type AdminProposalAction = "delete" | "investigate" | "block_supplier"

export type AdminProposal = {
  id: number
  rfq_id: string
  rfq_title: string | null
  price: number
  currency: string
  status: string
  open_reports_count: number
  has_contract: boolean
  supplier: AdminParty | null
  buyer: AdminParty | null
  created_at: string
}

export type AdminProposalParams = {
  page: number
  pageSize: number
  view: AdminProposalView
  query: string
}

export type AdminProposalListResponse = {
  items: AdminProposal[]
  total: number
  page: number
  page_size: number
  pages: number
  view_counts: Record<AdminProposalView, number>
}

export type AdminProposalDetail = AdminProposal & {
  delivery_time: string | null
  message: string | null
  attachment: {
    id: number
    file_name: string
    file_url: string
    file_type: string
  } | null
  supplier: AdminParty | null
  buyer: AdminParty | null
  rfq: { id: string; title: string; status: string } | null
  contract: {
    id: number
    title: string
    status: string
    agreed_amount: number
    currency: string
    created_at: string
  } | null
  messages: Array<{
    id: string
    source: string
    text: string
    sender_name: string
    created_at: string
  }>
  reports: Array<{
    id: number
    reason: string
    details: string | null
    status: string
    created_at: string
    resolved_at: string | null
    reporter: { id: number; email: string; name: string }
  }>
  history: Array<{
    id: number
    action: string
    details: Record<string, unknown>
    created_at: string
    actor: { id: number; email: string; name: string } | null
  }>
}

export type AdminProposalActionResponse = {
  id: number
  action: AdminProposalAction
  status: string
  blocked_company_id: number | null
}

export const adminApi = {
  getDashboard: () => apiFetch<AdminDashboardResponse>("/admin/dashboard"),
  getUsers: ({ page, pageSize, status, query }: AdminUsersParams) => {
    const searchParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    })
    if (status !== "all") {
      searchParams.set("status", status)
    }
    if (query.trim()) {
      searchParams.set("query", query.trim())
    }
    return apiFetch<AdminUsersResponse>(`/admin/users?${searchParams.toString()}`)
  },
  updateUserStatus: (userId: number, status: AdminUserStatus) =>
    apiFetch<AdminUser>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getCompanies: ({ page, pageSize, status, query }: AdminCompaniesParams) => {
    const searchParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      status,
    })
    if (query.trim()) {
      searchParams.set("query", query.trim())
    }
    return apiFetch<AdminCompaniesResponse>(
      `/admin/companies?${searchParams.toString()}`,
    )
  },
  getCompany: (companyId: number) =>
    apiFetch<AdminCompanyDetail>(`/admin/companies/${companyId}`),
  applyCompanyAction: (
    companyId: number,
    action: AdminCompanyAction,
    reason?: string,
  ) =>
    apiFetch<AdminCompanyActionResponse>(`/admin/companies/${companyId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, reason: reason?.trim() || null }),
    }),
  getCatalog: ({ page, pageSize, view, query }: AdminCatalogParams) => {
    const searchParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      view,
    })
    if (query.trim()) {
      searchParams.set("query", query.trim())
    }
    return apiFetch<AdminCatalogListResponse>(
      `/admin/catalog?${searchParams.toString()}`,
    )
  },
  getCatalogItem: (itemId: number) =>
    apiFetch<AdminCatalogDetail>(`/admin/catalog/${itemId}`),
  applyCatalogAction: (
    itemId: number,
    action: AdminCatalogAction,
    reason?: string,
  ) =>
    apiFetch<AdminCatalogActionResponse>(`/admin/catalog/${itemId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, reason: reason?.trim() || null }),
    }),
  getRfqs: ({ page, pageSize, view, query }: AdminRfqParams) => {
    const searchParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      view,
    })
    if (query.trim()) {
      searchParams.set("query", query.trim())
    }
    return apiFetch<AdminRfqListResponse>(`/admin/rfqs?${searchParams.toString()}`)
  },
  getRfq: (rfqId: string) => apiFetch<AdminRfqDetail>(`/admin/rfqs/${rfqId}`),
  applyRfqAction: (rfqId: string, action: AdminRfqAction, reason?: string) =>
    apiFetch<AdminRfqActionResponse>(`/admin/rfqs/${rfqId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, reason: reason?.trim() || null }),
    }),
  getProposals: ({ page, pageSize, view, query }: AdminProposalParams) => {
    const searchParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      view,
    })
    if (query.trim()) {
      searchParams.set("query", query.trim())
    }
    return apiFetch<AdminProposalListResponse>(
      `/admin/proposals?${searchParams.toString()}`,
    )
  },
  getProposal: (proposalId: number) =>
    apiFetch<AdminProposalDetail>(`/admin/proposals/${proposalId}`),
  applyProposalAction: (
    proposalId: number,
    action: AdminProposalAction,
    reason?: string,
  ) =>
    apiFetch<AdminProposalActionResponse>(`/admin/proposals/${proposalId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, reason: reason?.trim() || null }),
    }),
}
