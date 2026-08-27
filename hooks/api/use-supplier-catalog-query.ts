import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supplierCatalogApi } from "@/lib/api/supplier/catalog"
import { isApiEnabled } from "@/lib/api/config"
import type { CatalogItemInput, ItemStatus } from "@/types"

export const supplierCatalogKeys = {
  all: ["supplier-catalog"] as const,
  list: (status?: ItemStatus) => [...supplierCatalogKeys.all, "list", status] as const,
  detail: (id: number) => [...supplierCatalogKeys.all, "detail", id] as const,
}

export const useSupplierCatalogQuery = (status?: ItemStatus, enabled = true) =>
  useQuery({
    queryKey: supplierCatalogKeys.list(status),
    queryFn: () => supplierCatalogApi.list(status),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierCatalogItemQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: supplierCatalogKeys.detail(id),
    queryFn: () => supplierCatalogApi.get(id),
    enabled: enabled && isApiEnabled() && id > 0,
  })

export const useCreateCatalogItemMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CatalogItemInput) => supplierCatalogApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierCatalogKeys.all }),
    meta: {
      successMessage: "Услуга добавлена",
      errorMessage: "Не удалось добавить услугу",
    },
  })
}

export const useUpdateCatalogItemMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CatalogItemInput }) =>
      supplierCatalogApi.update(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: supplierCatalogKeys.all })
      qc.invalidateQueries({ queryKey: supplierCatalogKeys.detail(id) })
    },
    meta: {
      successMessage: "Услуга обновлена",
      errorMessage: "Не удалось обновить услугу",
    },
  })
}

export const useArchiveCatalogItemMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => supplierCatalogApi.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierCatalogKeys.all }),
    meta: {
      successMessage: "Услуга архивирована",
      errorMessage: "Не удалось архивировать услугу",
    },
  })
}
