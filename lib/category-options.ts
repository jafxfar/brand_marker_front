import type { CategoryTree } from "@/lib/api/public"
import type { Category } from "@/types"
import { catalogCategories } from "@/lib/mock/catalog-categories"
import { rfqCategories } from "@/lib/rfq-categories-list"
import { getRfqCategoryLabel as getMockRfqCategoryLabel } from "@/lib/mock/rfq-categories"

export type CategoryOption = {
  id: number
  name: string
  slug: string
}

export const flattenCategoryTree = (tree: CategoryTree[]): CategoryOption[] => {
  const result: CategoryOption[] = []
  const walk = (nodes: CategoryTree[]) => {
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name, slug: node.slug })
      if (node.children?.length) walk(node.children)
    }
  }
  walk(tree)
  return result
}

export const toCatalogCategoryOptions = (tree: CategoryTree[]): Category[] =>
  flattenCategoryTree(tree).map((c) => ({
    id: c.id,
    parent_id: null,
    name: c.name,
    slug: c.slug,
  }))

export const toRfqCategoryOptions = (
  tree: CategoryTree[],
): { id: string; label: string }[] =>
  flattenCategoryTree(tree).map((c) => ({
    id: c.slug,
    label: c.name,
  }))

export const resolveCategoryLabel = (
  categoryId: string,
  options: CategoryOption[],
  useApi: boolean,
): string => {
  if (!useApi) return getMockRfqCategoryLabel(categoryId)

  const match = options.find(
    (c) => c.slug === categoryId || String(c.id) === categoryId,
  )
  return match?.name ?? categoryId
}

export const offlineCatalogCategories = catalogCategories
export const offlineRfqCategories = rfqCategories
