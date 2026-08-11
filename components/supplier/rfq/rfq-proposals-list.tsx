import type { Proposal } from "@/types"
import { proposalStatusMeta } from "@/lib/proposal-display"
import { formatCurrency } from "@/lib/format"

type RfqProposalsListProps = {
  proposals: Proposal[]
  currentActorId: number
  getSupplierName: (supplierId: number) => string
}

export const RfqProposalsList = ({
  proposals,
  currentActorId,
  getSupplierName,
}: RfqProposalsListProps) => (
  <section className="bg-card border border-border rounded-xl p-6">
    <h2 className="text-sm font-semibold text-foreground mb-4">
      Существующие предложения
      {proposals.length > 0 && (
        <span className="ml-2 text-sm font-normal text-muted-foreground">({proposals.length})</span>
      )}
    </h2>

    {proposals.length === 0 ? (
      <p className="text-sm text-muted-foreground">Пока нет предложений от других поставщиков</p>
    ) : (
      <div className="space-y-3">
        {proposals.map((proposal) => {
          const meta = proposalStatusMeta[proposal.status]
          const isMine = proposal.supplier_actor_id === currentActorId
          return (
            <div
              key={proposal.id}
              className={`rounded-xl border p-4 ${
                isMine ? "border-primary/30 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {getSupplierName(proposal.supplier_actor_id)}
                    {isMine && (
                      <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Ваше
                      </span>
                    )}
                  </p>
                  {proposal.message && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proposal.message}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(proposal.price, proposal.currency)}
                  </p>
                  {proposal.delivery_time && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{proposal.delivery_time}</p>
                  )}
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </section>
)
