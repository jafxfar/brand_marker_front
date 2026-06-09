"use client"

import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
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

export const MediaFields = ({ media, onChange }: MediaFieldsProps) => {
  const handleAdd = () => {
    onChange([
      ...media,
      { file_name: "", file_url: "#", media_type: "image" },
    ])
  }

  const handleRemove = (index: number) => {
    onChange(media.filter((_, i) => i !== index))
  }

  const handleUpdate = (index: number, patch: Partial<MediaFieldRow>) => {
    onChange(media.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  const inputClass =
    "w-full h-10 px-3 rounded-xl border border-input bg-white text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"

  return (
    <div className="space-y-3">
      {media.map((item, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
          <div className="sm:col-span-4">
            <input
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
          <div className="sm:col-span-4">
            <input
              type="text"
              value={item.file_url}
              onChange={(e) => handleUpdate(index, { file_url: e.target.value })}
              placeholder="URL (демо)"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="h-10 w-10 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors flex items-center justify-center"
              aria-label="Удалить файл"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
      >
        <Plus size={15} /> Добавить файл
      </button>
    </div>
  )
}
