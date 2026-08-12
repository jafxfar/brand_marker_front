import { Download, FileText } from "lucide-react"
import type { ContractFile } from "@/types"
import { formatIsoDate } from "@/lib/format"

type ContractFilesPanelProps = {
  files: ContractFile[]
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
            <button
              type="button"
              onClick={() => {
                if (!file.file_url || file.file_url === "#") return
                window.open(file.file_url, "_blank", "noopener,noreferrer")
              }}
              className="w-full flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-secondary/50 transition-colors text-left"
              aria-label={`Скачать ${file.file_name}`}
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file.file_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatIsoDate(file.created_at.split("T")[0] ?? file.created_at)}
                </p>
              </div>
              <Download size={16} className="text-muted-foreground flex-shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
)
