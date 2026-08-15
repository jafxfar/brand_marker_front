import { FILES_BASE_URL } from "@/lib/api/config"

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)$/i

export const resolveFileUrl = (url: string | null | undefined): string => {
  if (!url) return ""
  const value = url.trim()
  if (!value || value === "#") return ""
  if (value.startsWith("blob:") || value.startsWith("data:")) return value
  if (/^https?:\/\//i.test(value)) return value

  const path = value.replace(/^\/+/, "")
  return `${FILES_BASE_URL}/${path}`
}

export const isImageFile = (
  url: string,
  fileType?: string | null,
  fileName?: string | null,
): boolean => {
  if (fileType?.startsWith("image/")) return true
  if (fileName && IMAGE_EXT.test(fileName)) return true
  return IMAGE_EXT.test((url.split("?")[0] ?? ""))
}
