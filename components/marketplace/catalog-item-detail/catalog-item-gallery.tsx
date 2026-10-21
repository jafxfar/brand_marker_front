"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { FileText, ImageIcon, Play } from "lucide-react"
import type { ItemMedia } from "@/types"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

type CatalogItemGalleryProps = {
  media: ItemMedia[]
  title: string
}

type GalleryItem = {
  key: number
  kind: "image" | "video" | "document"
  url: string
  fileName: string
}

export const CatalogItemGallery = ({ media, title }: CatalogItemGalleryProps) => {
  const items = useMemo<GalleryItem[]>(() => {
    const sorted = [...media].sort((a, b) => a.sort_order - b.sort_order)
    return sorted
      .map((entry) => {
        const url = resolveFileUrl(entry.file_url)
        if (!url) return null
        const kind =
          entry.media_type === "video"
            ? "video"
            : entry.media_type === "document"
              ? "document"
              : "image"
        return {
          key: entry.id,
          kind,
          url,
          fileName: entry.file_name,
        } satisfies GalleryItem
      })
      .filter((entry): entry is GalleryItem => entry != null)
  }, [media])

  const visualItems = items.filter((item) => item.kind !== "document")
  const documents = items.filter((item) => item.kind === "document")
  const [activeIndex, setActiveIndex] = useState(0)
  const [mode, setMode] = useState<"photos" | "video">("photos")

  const photos = visualItems.filter((item) => item.kind === "image")
  const videos = visualItems.filter((item) => item.kind === "video")
  const modeItems = mode === "video" ? videos : photos.length ? photos : visualItems
  const safeIndex = modeItems.length ? Math.min(activeIndex, modeItems.length - 1) : 0
  const active = modeItems[safeIndex]

  if (visualItems.length === 0 && documents.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-border bg-secondary">
        <ImageIcon size={40} className="text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {modeItems.length > 1 && (
          <div className="hidden max-h-[420px] w-16 shrink-0 flex-col gap-2 overflow-y-auto sm:flex">
            {modeItems.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border bg-secondary transition-colors",
                  index === safeIndex
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/40",
                )}
                aria-label={`Миниатюра ${index + 1}`}
              >
                {item.kind === "image" ? (
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Play size={16} className="text-muted-foreground" aria-hidden="true" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-secondary">
          <div className="relative aspect-square w-full sm:aspect-[4/3]">
            {active?.kind === "image" ? (
              <Image
                src={active.url}
                alt={title}
                fill
                unoptimized
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 420px"
                priority
              />
            ) : active?.kind === "video" ? (
              <video
                src={active.url}
                controls
                className="h-full w-full object-contain"
                aria-label={title}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon size={40} className="text-muted-foreground" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>

      {(photos.length > 0 || videos.length > 0) && (
        <div className="flex gap-2">
          {photos.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMode("photos")
                setActiveIndex(0)
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                mode === "photos"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              Фото
            </button>
          )}
          {videos.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMode("video")
                setActiveIndex(0)
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                mode === "video"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              Видео
            </button>
          )}
        </div>
      )}

      {modeItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:hidden">
          {modeItems.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-secondary",
                index === safeIndex ? "border-primary" : "border-border",
              )}
              aria-label={`Миниатюра ${index + 1}`}
            >
              {item.kind === "image" ? (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Play size={14} className="text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-1.5">
          {documents.map((doc) => (
            <a
              key={doc.key}
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <FileText size={15} aria-hidden="true" />
              {doc.fileName}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
