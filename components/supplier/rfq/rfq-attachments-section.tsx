import { FileText, Download } from "lucide-react"
import type { RfqAttachment } from "@/types"

type RfqAttachmentsSectionProps = {
  attachments: RfqAttachment[]
}

export const RfqAttachmentsSection = ({ attachments }: RfqAttachmentsSectionProps) => (
  <section className="bg-white border border-border rounded-2xl p-6">
    <h2 className="text-base font-bold text-foreground mb-4">Вложения</h2>
    {attachments.length === 0 ? (
      <p className="text-sm text-muted-foreground">Вложений нет</p>
    ) : (
      <ul className="space-y-2">
        {attachments.map((file) => (
          <li key={file.id}>
            <a
              href={file.file_url}
              className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/30 hover:bg-secondary/30 transition-colors"
              onClick={(e) => e.preventDefault()}
              aria-label={`Скачать ${file.file_name}`}
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1 truncate">
                {file.file_name}
              </span>
              <Download size={16} className="text-muted-foreground flex-shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    )}
  </section>
)
