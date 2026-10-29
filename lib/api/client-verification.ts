import { apiFetch } from "@/lib/api/client"

export type IndividualVerificationStatus =
  | "none"
  | "pending"
  | "needs_documents"
  | "verified"
  | "rejected"

export type IndividualDocumentType = "passport" | "selfie" | "patent" | "other"

export const INDIVIDUAL_STATUS_LABELS: Record<IndividualVerificationStatus, string> = {
  none: "Не проверен",
  pending: "На проверке",
  needs_documents: "Нужны документы",
  verified: "Проверен",
  rejected: "Отклонено",
}

export const INDIVIDUAL_DOCUMENT_TYPE_LABELS: Record<IndividualDocumentType, string> = {
  passport: "Паспорт",
  selfie: "Селфи с документом",
  patent: "Патент / регистрация ИП",
  other: "Другой документ",
}

export type IndividualDocument = {
  id: number
  doc_type: IndividualDocumentType
  doc_type_label: string
  file_name: string | null
  file_url: string | null
  status: string
  uploaded_at: string
  uploaded_by_admin: boolean
}

export type MyIndividualVerification = {
  user_id: number
  status: IndividualVerificationStatus
  status_label: string
  reason: string | null
  submitted_at: string | null
  verified_at: string | null
  sides: Array<"buyer" | "supplier">
  is_individual: boolean
  documents: IndividualDocument[]
  can_edit_documents: boolean
  can_upload: boolean
  can_submit: boolean
}

export type AdminIndividualListStatus = "queue" | "all" | IndividualVerificationStatus

export type AdminIndividualsParams = {
  page?: number
  pageSize?: number
  status?: AdminIndividualListStatus
  side?: "buyer" | "supplier" | null
  query?: string
}

export type AdminIndividual = {
  id: number
  email: string
  name: string
  phone: string | null
  account_status: string
  verification_status: IndividualVerificationStatus
  verification_reason: string | null
  submitted_at: string | null
  verified_at: string | null
  created_at: string
  sides: Array<"buyer" | "supplier">
  documents_count: number
}

export type AdminIndividualsResponse = {
  items: AdminIndividual[]
  total: number
  page: number
  page_size: number
  pages: number
  status_counts: Record<string, number>
}

export type AdminIndividualHistoryItem = {
  id: number
  action: string
  details: Record<string, unknown>
  created_at: string
  actor: { id: number; email: string; name: string } | null
}

export type AdminIndividualDetail = {
  id: number
  email: string
  name: string
  phone: string | null
  role: string
  account_status: string
  created_at: string
  verification_status: IndividualVerificationStatus
  verification_status_label: string
  verification_reason: string | null
  submitted_at: string | null
  verified_at: string | null
  verified_by: { email: string; name: string | null } | null
  sides: Array<"buyer" | "supplier">
  companies_count: number
  documents: IndividualDocument[]
  history: AdminIndividualHistoryItem[]
}

export type AdminIndividualAction = "approve" | "reject" | "request_documents" | "set"

export type AdminVerificationCounts = {
  supplier_companies: number
  buyer_companies: number
  individuals: number
  changes: number
}

export type AdminDossierRiskLevel = "low" | "medium" | "high"

export type AdminUserDossier = {
  user: {
    id: number
    email: string
    name: string
    phone: string | null
    role: string
    status: string
    banned_until: string | null
    block_reason: string | null
    created_at: string
    account_age_days: number
    totp_enabled: boolean
    last_login_at: string | null
    last_login_ip: string | null
  }
  identity: {
    status: IndividualVerificationStatus
    status_label: string
    reason: string | null
    submitted_at: string | null
    verified_at: string | null
    sides: Array<"buyer" | "supplier">
    documents: IndividualDocument[]
  }
  companies: Array<{
    id: number
    title: string
    role: string
    is_owner: boolean
    actor_type: string
    sides: string[]
    verification_status: string
    operational_status: string
  }>
  signals: {
    disputes_total: number
    disputes_opened_by: number
    disputes_against: number
    disputes_active: number
    disputes_lost: number
    contracts_total: number
    contracts_cancelled: number
    contracts_completed: number
    contracts_active: number
    complaints_total: number
    complaints_open: number
    complaints_catalog: number
    complaints_rfq: number
    complaints_proposal: number
    complaints_filed: number
    blocks_count: number
    failed_logins_30d: number
    distinct_ips_30d: number
    account_age_days: number
  }
  money: {
    currency: string
    buyer_turnover: number
    supplier_turnover: number
    contracts_as_buyer: number
    contracts_as_supplier: number
    escrow_held_as_buyer: number
    escrow_held_as_supplier: number
    pending_withdrawals_count: number
    pending_withdrawals_amount: number
  }
  reviews: Record<"buyer" | "supplier", { count: number; avg: number | null }>
  blocks: Array<{
    id: number
    action: string
    status: string
    reason: string | null
    created_at: string
    admin: string | null
  }>
  risk: {
    level: AdminDossierRiskLevel
    label: string
    score: number
    reasons: Array<{ code: string; weight: number; label: string }>
  }
}

const documentForm = (file: File, docType: IndividualDocumentType) => {
  const form = new FormData()
  form.append("file", file)
  form.append("doc_type", docType)
  return form
}

export const myVerificationApi = {
  get: () => apiFetch<MyIndividualVerification>("/me/verification"),
  uploadDocument: (file: File, docType: IndividualDocumentType) =>
    apiFetch<MyIndividualVerification>("/me/verification/documents", {
      method: "POST",
      body: documentForm(file, docType),
    }),
  deleteDocument: (documentId: number) =>
    apiFetch<MyIndividualVerification>(`/me/verification/documents/${documentId}`, {
      method: "DELETE",
    }),
  submit: () =>
    apiFetch<MyIndividualVerification>("/me/verification/submit", { method: "POST" }),
}

export const adminClientsApi = {
  getCounts: () => apiFetch<AdminVerificationCounts>("/admin/verification/counts"),
  getIndividuals: (params: AdminIndividualsParams = {}) => {
    const search = new URLSearchParams()
    search.set("page", String(params.page ?? 1))
    search.set("page_size", String(params.pageSize ?? 20))
    if (params.status) search.set("status", params.status)
    if (params.side) search.set("side", params.side)
    if (params.query?.trim()) search.set("query", params.query.trim())
    return apiFetch<AdminIndividualsResponse>(`/admin/individuals?${search.toString()}`)
  },
  getIndividual: (userId: number) =>
    apiFetch<AdminIndividualDetail>(`/admin/individuals/${userId}`),
  setVerification: (
    userId: number,
    payload: {
      action: AdminIndividualAction
      status?: IndividualVerificationStatus
      reason?: string
    },
  ) =>
    apiFetch<AdminIndividualDetail>(`/admin/individuals/${userId}/verification`, {
      method: "POST",
      body: JSON.stringify({
        action: payload.action,
        status: payload.status ?? null,
        reason: payload.reason?.trim() || null,
      }),
    }),
  addDocument: (userId: number, file: File, docType: IndividualDocumentType) =>
    apiFetch<AdminIndividualDetail>(`/admin/individuals/${userId}/documents`, {
      method: "POST",
      body: documentForm(file, docType),
    }),
  deleteDocument: (userId: number, documentId: number) =>
    apiFetch<AdminIndividualDetail>(`/admin/individuals/${userId}/documents/${documentId}`, {
      method: "DELETE",
    }),
  getDossier: (userId: number) =>
    apiFetch<AdminUserDossier>(`/admin/users/${userId}/dossier`),
}
