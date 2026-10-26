"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { FileText, ImagePlus, Link2, Loader2, Trash2, Video } from "lucide-react"
import { isApiEnabled } from "@/lib/api/config"
import { supplierCatalogApi } from "@/lib/api/supplier/catalog"
import { resolveFileUrl } from "@/lib/file-url"
import type { ItemMediaType } from "@/types"

export type MediaFieldRow = {
  file_name: string
  file_url: string
  media_type: ItemMediaType
}

type MediaFieldsProps = {
  media: MediaFieldRow[]
  onChange: (media: MediaFieldRow[]) => void
}

const mediaTypes: { value: ItemMediaType; label: string }[] = [
  { value: "image", label: "Изображение" },
  { value: "document", label: "Документ" },
  { value: "video", label: "Видео" },
]

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf,.doc,.docx,.zip"

const mediaTypeFromFile = (file: File): ItemMediaType => {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  return "document"
}

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"))
    reader.readAsDataURL(file)
  })

const MediaPreview = ({ item }: { item: MediaFieldRow }) => {
  const [broken, setBroken] = useState(false)
  const previewUrl = resolveFileUrl(item.file_url)
  const showImage = item.media_type === "image" && previewUrl && !broken

  if (showImage) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      </div>
    )
  }

  const Icon =
    item.media_type === "video" ? Video : item.media_type === "image" ? ImagePlus : FileText

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary text-muted-foreground">
      <Icon size={18} aria-hidden="true" />
      <span className="sr-only">
        {item.media_type === "video"
          ? "Видео"
          : item.media_type === "image"
            ? "Изображение"
            : "Документ"}
      </span>
    </div>
  )
}

export const MediaFields = ({ media, onChange }: MediaFieldsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddLink = () => {
    onChange([
      ...media,
      { file_name: "", file_url: "", media_type: "image" },
    ])
  }

  const handleRemove = (index: number) => {
    onChange(media.filter((_, i) => i !== index))
  }

  const handleUpdate = (index: number, patch: Partial<MediaFieldRow>) => {
    onChange(media.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (files.length === 0) return

    setError(null)
    setUploading(true)
    try {
      const uploaded: MediaFieldRow[] = []
      for (const file of files) {
        if (isApiEnabled()) {
          const result = await supplierCatalogApi.uploadMedia(file)
          uploaded.push({
            file_name: result.file_name || file.name,
            file_url: result.file_url,
            media_type: result.media_type || mediaTypeFromFile(file),
          })
        } else {
          uploaded.push({
            file_name: file.name,
            file_url: await readAsDataUrl(file),
            media_type: mediaTypeFromFile(file),
          })
        }
      }
      onChange([...media, ...uploaded])
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Не удалось загрузить файл"
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const inputClass =
    "w-full h-10 px-3 rounded-xl border border-input bg-card text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {media.map((item, index) => (
        <div
          key={`${item.file_url}-${index}`}
          className="rounded-xl border border-border p-3 space-y-2"
        >
          <div className="flex items-start gap-3">
            <MediaPreview key={item.file_url || item.file_name || index} item={item} />
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <input
                  maxLength={255}
                  type="text"
                  value={item.file_name}
                  onChange={(e) => handleUpdate(index, { file_name: e.target.value })}
                  placeholder="Имя файла"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-3">
                <select
                  value={item.media_type}
                  onChange={(e) =>
                    handleUpdate(index, { media_type: e.target.value as ItemMediaType })
                  }
                  className={inputClass}
                >
                  {mediaTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4 flex gap-2">
                <input
                  type="text"
                  value={item.file_url}
                  onChange={(e) => handleUpdate(index, { file_url: e.target.value })}
                  placeholder="https://..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="h-10 w-10 shrink-0 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors flex items-center justify-center"
                  aria-label="Удалить файл"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-dashed border-primary/40 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors disabled:opacity-60"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {uploading ? "Загрузка..." : "Загрузить файл"}
        </button>
        <button
          type="button"
          onClick={handleAddLink}
          disabled={uploading}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-60"
        >
          <Link2 size={15} /> По ссылке
        </button>
      </div>
    </div>
  )
}
