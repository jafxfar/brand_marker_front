import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { publicKeys } from "@/hooks/api/use-public-query"
import { adminApi, type AdminCategoryInput } from "@/lib/api/admin"

export const adminCategoriesKeys = {
  all: ["admin-categories"] as const,
  list: () => [...adminCategoriesKeys.all, "list"] as const,
}

export const useAdminCategoriesQuery = () =>
  useQuery({
    queryKey: adminCategoriesKeys.list(),
    queryFn: adminApi.getCategories,
  })

const useInvalidateCategories = () => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminCategoriesKeys.all }),
      queryClient.invalidateQueries({ queryKey: publicKeys.categories() }),
    ])
}

export const useCreateCategoryMutation = () => {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (data: AdminCategoryInput) => adminApi.createCategory(data),
    onSuccess: invalidate,
    meta: {
      successMessage: "Категория создана",
      errorMessage: "Не удалось создать категорию",
    },
  })
}

export const useUpdateCategoryMutation = () => {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: Partial<AdminCategoryInput> }) =>
      adminApi.updateCategory(categoryId, data),
    onSuccess: invalidate,
    meta: {
      successMessage: "Категория обновлена",
      errorMessage: "Не удалось обновить категорию",
    },
  })
}

export const useDeleteCategoryMutation = () => {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (categoryId: number) => adminApi.deleteCategory(categoryId),
    onSuccess: invalidate,
    meta: {
      successMessage: "Категория удалена",
      errorMessage: "Не удалось удалить категорию",
    },
  })
}
