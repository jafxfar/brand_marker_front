import type { Area } from "react-easy-crop"

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Не удалось открыть изображение"))
    img.crossOrigin = "anonymous"
    img.src = src
  })
}

/** Draw crop region to a canvas and return a JPEG File. */
export async function cropImageToFile(
  imageSrc: string,
  crop: Area,
  fileName: string,
  mimeType = "image/jpeg",
  quality = 0.92,
): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement("canvas")
  const w = Math.max(1, Math.round(crop.width))
  const h = Math.max(1, Math.round(crop.height))
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas недоступен")

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, w, h)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Не удалось обрезать фото"))),
      mimeType,
      quality,
    )
  })

  const base = fileName.replace(/\.[^.]+$/, "") || "photo"
  const ext = mimeType === "image/png" ? "png" : "jpg"
  return new File([blob], `${base}-crop.${ext}`, { type: mimeType })
}
