import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { BuyerRfqStatusFilter } from "@/lib/buyer-rfq-display"
import { rfqsApi } from "@/lib/api/rfqs"
import { isApiEnabled } from "@/lib/api/config"
import type { RfqCreate, RfqUpdate } from "@/types"

export const rfqKeys = {
  all: ["rfqs"] as const,
  list: (tab?: string) => [...rfqKeys.all, "list", tab ?? "all"] as const,
  detail: (id: string) => [...rfqKeys.all, "detail", id] as const,
}

export const useRfqsQuery = (filter: BuyerRfqStatusFilter, enabled = true) =>
  useQuery({
    queryKey: rfqKeys.list(filter),
    queryFn: () => rfqsApi.list(filter),
    enabled: enabled && isApiEnabled(),
  })

export const useActiveRfqsQuery = (enabled = true) =>
  useQuery({
    queryKey: rfqKeys.list("active"),
    queryFn: () => rfqsApi.list("active"),
    enabled: enabled && isApiEnabled(),
  })

export const useRfqQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: rfqKeys.detail(id),
    queryFn: () => rfqsApi.get(id),
    enabled: enabled && isApiEnabled() && Boolean(id),
  })

const invalidateRfqs = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: rfqKeys.all })

export const useCreateRfqMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RfqCreate) => rfqsApi.create(data),
    onSuccess: () => invalidateRfqs(qc),
    meta: {
      errorMessage: "Не удалось создать заявку",
    },
  })
}

export const useUpdateRfqMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RfqUpdate }) => rfqsApi.update(id, data),
    onSuccess: (_d, { id }) => {
      invalidateRfqs(qc)
      qc.invalidateQueries({ queryKey: rfqKeys.detail(id) })
    },
    meta: {
      errorMessage: "Не удалось обновить заявку",
    },
  })
}

export const usePublishRfqMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rfqsApi.publish(id),
    onSuccess: (_d, id) => {
      invalidateRfqs(qc)
      qc.invalidateQueries({ queryKey: rfqKeys.detail(id) })
    },
    meta: {
      successMessage: "Заявка опубликована",
      errorMessage: "Не удалось опубликовать заявку",
    },
  })
}

export const useCloseRfqMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rfqsApi.close(id),
    onSuccess: (_d, id) => {
      invalidateRfqs(qc)
      qc.invalidateQueries({ queryKey: rfqKeys.detail(id) })
    },
    meta: {
      successMessage: "Заявка закрыта",
      errorMessage: "Не удалось закрыть заявку",
    },
  })
}

export const useInviteSuppliersMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, supplierIds }: { id: string; supplierIds: number[] }) =>
      rfqsApi.invite(id, supplierIds),
    onSuccess: (_d, { id }) => {
      invalidateRfqs(qc)
      qc.invalidateQueries({ queryKey: rfqKeys.detail(id) })
    },
    meta: {
      errorMessage: "Не удалось пригласить поставщика",
    },
  })
}

export const useUploadRfqAttachmentMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      rfqsApi.uploadAttachment(id, file),
    onSuccess: (_d, { id }) => {
      invalidateRfqs(qc)
      qc.invalidateQueries({ queryKey: rfqKeys.detail(id) })
    },
    meta: {
      errorMessage: "Не удалось загрузить файл",
    },
  })
}

export const useDeleteRfqAttachmentMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, attachmentId }: { id: string; attachmentId: string }) =>
      rfqsApi.deleteAttachment(id, attachmentId),
    onSuccess: (_d, { id }) => {
      invalidateRfqs(qc)
      qc.invalidateQueries({ queryKey: rfqKeys.detail(id) })
    },
    meta: {
      successMessage: "Вложение удалено",
      errorMessage: "Не удалось удалить вложение",
    },
  })
}
