export type SupplierProfileFacts = {
  founded: string
  staff: string
  area: string
  markets: string
  brands: string
}

export type SupplierCompanyProfileExtra = {
  photos: { src: string; name: string }[]
  facts: SupplierProfileFacts
  clients: string
  certs: string[]
}

export const DEFAULT_SUPPLIER_PROFILE_EXTRA = (): SupplierCompanyProfileExtra => ({
  photos: [],
  facts: {
    founded: "",
    staff: "",
    area: "",
    markets: "",
    brands: "",
  },
  clients: "",
  certs: [],
})

const storageKey = (companyId: number) => `supplier.companyProfile.${companyId}`

export const readSupplierProfileExtra = (
  companyId: number,
): SupplierCompanyProfileExtra => {
  if (typeof window === "undefined") return DEFAULT_SUPPLIER_PROFILE_EXTRA()
  try {
    const raw = localStorage.getItem(storageKey(companyId))
    if (!raw) return DEFAULT_SUPPLIER_PROFILE_EXTRA()
    const parsed = JSON.parse(raw) as Partial<SupplierCompanyProfileExtra>
    const base = DEFAULT_SUPPLIER_PROFILE_EXTRA()
    return {
      photos: parsed.photos ?? base.photos,
      facts: { ...base.facts, ...(parsed.facts ?? {}) },
      clients: parsed.clients ?? "",
      certs: parsed.certs ?? [],
    }
  } catch {
    return DEFAULT_SUPPLIER_PROFILE_EXTRA()
  }
}

export const writeSupplierProfileExtra = (
  companyId: number,
  data: SupplierCompanyProfileExtra,
) => {
  localStorage.setItem(storageKey(companyId), JSON.stringify(data))
}

export const profileCompleteness = (
  about: string,
  extra: SupplierCompanyProfileExtra,
): number => {
  const checks = [
    about.trim().length > 80,
    extra.photos.length >= 3,
    Object.values(extra.facts).filter(Boolean).length >= 4,
    Boolean(extra.clients.trim()),
    extra.certs.length > 0,
  ]
  return checks.filter(Boolean).length * 20
}
