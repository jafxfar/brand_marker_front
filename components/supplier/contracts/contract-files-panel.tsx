import { FilePreviewLink } from "@/components/shared/file-preview-link"
import type { ContractFile } from "@/types"
import { formatIsoDate } from "@/lib/format"

type ContractFilesPanelProps = {
  files: ContractFile[]
}

const sideLabel: Record<"buyer" | "supplier", string> = {
  buyer: "Заказчик",
  supplier: "Исполнитель",
}

const fileMetaLine = (file: ContractFile): string => {
  const parts: string[] = []
  if (file.uploaded_by_name) parts.push(file.uploaded_by_name)
  if (file.uploaded_by_side) parts.push(sideLabel[file.uploaded_by_side])
  parts.push(formatIsoDate(file.created_at.split("T")[0] ?? file.created_at))
  return parts.join(" · ")
}

export const ContractFilesPanel = ({ files }: ContractFilesPanelProps) => (
  <section className="bg-card border border-border rounded-xl p-6">
    <h2 className="text-sm font-semibold text-foreground mb-4">Файлы</h2>

    {files.length === 0 ? (
      <p className="text-sm text-muted-foreground">Файлы не прикреплены</p>
    ) : (
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id}>
            <FilePreviewLink
              url={file.file_url}
              fileName={file.file_name}
              fileType={file.file_type}
            />
            <p className="text-xs text-muted-foreground mt-1 px-1">
              {fileMetaLine(file)}
            </p>
          </li>
        ))}
      </ul>
    )}
  </section>
)
