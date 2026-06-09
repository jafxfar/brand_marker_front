import type { Currency } from "./proposal"
import type {
  PaymentPlanWithMilestones,
  PaymentType,
} from "./payment"

export const CONTRACT_STATUSES = [
  "pending_payment",
  "active",
  "delivered",
  "completed",
  "cancelled",
  "disputed",
] as const

export type ContractStatus = (typeof CONTRACT_STATUSES)[number]

export const WORK_SUBMISSION_STATUSES = [
  "pending",
  "accepted",
  "rejected",
] as const

export type WorkSubmissionStatus =
  (typeof WORK_SUBMISSION_STATUSES)[number]

export const WORK_SUBMISSION_TYPES = ["delivery", "work"] as const

export type WorkSubmissionType = (typeof WORK_SUBMISSION_TYPES)[number]

export type MessageAttachment = {
  id: number
  message_id: number
  file_name: string
  file_url: string
  file_type: string
}

export type Message = {
  id: number
  conversation_id: number
  sender_id: number
  text: string
  attachment: MessageAttachment | null
}

export type Conversation = {
  id: number
  contract_id: number
}

export type ConversationWithMessages = Conversation & {
  messages: Message[]
}

export type ContractFile = {
  id: number
  contract_id: number
  file_name: string
  file_url: string
  file_type: string
  uploaded_by: number
  created_at: string
}

export type WorkSubmission = {
  id: number
  contract_id: number
  type: WorkSubmissionType
  note: string
  status: WorkSubmissionStatus
  submitted_at: string
  file_names: string[]
}

export type Contract = {
  id: number
  rfq_id: string
  proposal_id: number
  buyer_actor_id: number
  supplier_actor_id: number
  title: string
  description: string | null
  agreed_amount: number
  currency: Currency
  start_date: string
  due_date: string
  payment_type: PaymentType
  created_at: string
  status: ContractStatus
}

export type ContractWithRelations = Contract & {
  payment_plan: PaymentPlanWithMilestones | null
  conversation: ConversationWithMessages | null
  files: ContractFile[]
  submissions: WorkSubmission[]
}

export type ContractCreate = Omit<
  Contract,
  "id" | "status" | "created_at"
> & {
  status?: ContractStatus
}

export type ContractUpdate = Partial<
  Omit<
    Contract,
    "id" | "rfq_id" | "proposal_id" | "buyer_actor_id" | "supplier_actor_id" | "created_at"
  >
>

export type ConversationCreate = Omit<Conversation, "id">

export type MessageCreate = Omit<Message, "id">

export type MessageAttachmentCreate = Omit<MessageAttachment, "id">

export type ContractFileCreate = Omit<ContractFile, "id">

export type WorkSubmissionCreate = Omit<WorkSubmission, "id" | "submitted_at" | "status"> & {
  status?: WorkSubmissionStatus
}
