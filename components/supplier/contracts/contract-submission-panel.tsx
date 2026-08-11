"use client"

import { useState } from "react"
import { Package, Plus, X } from "lucide-react"
import type { ContractWithRelations } from "@/types"
import {
  getSubmissionTypeLabel,
  workSubmissionStatusMeta,
} from "@/lib/contract-display"
import { formatIsoDate } from "@/lib/format"

type ContractSubmissionPanelProps = {
  contract: ContractWithRelations
  onSubmit: (input: { note: string; fileNames: string[] }) => void
  disabled?: boolean
}

export const ContractSubmissionPanel = ({
  contract,
  onSubmit,
  disabled = false,
}: ContractSubmissionPanelProps) => {
  const [note, setNote] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileNames, setFileNames] = useState<string[]>([])
  const submissions = [...contract.submissions].sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  )

  const canSubmit =
    !disabled &&
    !["completed", "cancelled", "disputed"].includes(contract.status)

  const handleAddFile = () => {
    const trimmed = fileName.trim()
    if (!trimmed || fileNames.includes(trimmed)) return
    setFileNames((prev) => [...prev, trimmed])
    setFileName("")
  }

  const handleRemoveFile = (name: string) => {
    setFileNames((prev) => prev.filter((f) => f !== name))
  }

  const handleSubmit = () => {
    const trimmedNote = note.trim()
    if (!trimmedNote) return
    onSubmit({ note: trimmedNote, fileNames })
    setNote("")
    setFileNames([])
  }

  const submissionLabel =
    submissions[0]?.type
      ? getSubmissionTypeLabel(submissions[0].type)
      : contract.status === "delivered"
        ? "Доставка"
        : "Выполнение работ"

  return (
    <section className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Package size={16} className="text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{submissionLabel}</h2>
      </div>

      {canSubmit && (
        <div className="rounded-xl border border-border p-4 mb-5 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Опишите выполненную работу или детали доставки..."
            aria-label="Комментарий к отправке"
            className="w-full px-4 py-3 rounded-xl border border-input bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFile()}
              placeholder="Имя файла (демо)"
              aria-label="Имя файла"
              className="flex-1 h-10 px-4 rounded-xl border border-input bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={handleAddFile}
              className="h-10 px-3 rounded-xl border border-border hover:bg-secondary transition-colors"
              aria-label="Добавить файл"
            >
              <Plus size={16} />
            </button>
          </div>

          {fileNames.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {fileNames.map((name) => (
                <li
                  key={name}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-secondary"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(name)}
                    aria-label={`Удалить ${name}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!note.trim()}
            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Отправить на проверку
          </button>
        </div>
      )}

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Отправок пока нет</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => {
            const meta = workSubmissionStatusMeta[submission.status]
            return (
              <div key={submission.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {getSubmissionTypeLabel(submission.type)} · {formatIsoDate(submission.submitted_at.split("T")[0] ?? submission.submitted_at)}
                    </p>
                    <p className="text-sm text-foreground mt-1">{submission.note}</p>
                  </div>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>
                {submission.file_names.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5 mt-2">
                    {submission.file_names.map((name) => (
                      <li
                        key={name}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-muted-foreground"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
