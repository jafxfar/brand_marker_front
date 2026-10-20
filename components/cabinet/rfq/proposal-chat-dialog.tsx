"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProposalMessagesPanel } from "@/components/cabinet/rfq/proposal-messages-panel"
import { PROPOSAL_CHAT_OPEN_STATUSES } from "@/lib/proposal-display"
import type { ProposalChatSide } from "@/hooks/api/use-proposals-query"
import type { ProposalStatus } from "@/types"

type ProposalChatDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: number
  proposalStatus: ProposalStatus
  side: ProposalChatSide
  peerName: string
}

export const ProposalChatDialog = ({
  open,
  onOpenChange,
  proposalId,
  proposalStatus,
  side,
  peerName,
}: ProposalChatDialogProps) => {
  const canSend = PROPOSAL_CHAT_OPEN_STATUSES.includes(proposalStatus)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl p-0 overflow-hidden flex flex-col h-[min(70vh,560px)] max-h-[88vh] gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border text-left shrink-0">
          <DialogTitle>Обсуждение проекта</DialogTitle>
          <DialogDescription>
            {canSend
              ? `Переписка с ${peerName} по этому предложению`
              : `История переписки с ${peerName}. Обсуждение закрыто`}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ProposalMessagesPanel
            proposalId={proposalId}
            proposalStatus={proposalStatus}
            side={side}
            peerName={peerName}
            className="border-0 rounded-none min-h-0 flex-1"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
