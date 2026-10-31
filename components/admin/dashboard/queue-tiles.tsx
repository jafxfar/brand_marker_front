import Link from "next/link"
import {
  Building2,
  Boxes,
  Flag,
  RefreshCw,
  MessageSquare,
  Scale,
  Landmark,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type QueueTile = {
  id: string
  label: string
  hint: string
  count: number
  href: string
  Icon: LucideIcon
}

type QueueTilesProps = {
  tiles: QueueTile[]
}

export const QueueTiles = ({ tiles }: QueueTilesProps) => (
  <section className="grid gap-3" aria-label="Очереди проверок">
    <span className="text-[13px] font-semibold text-mute">
      Все проверки проходят через администратора
    </span>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((tile) => {
        const hot = tile.count > 0
        return (
          <Link
            key={tile.id}
            href={tile.href}
            className={cn(
              "grid gap-1 rounded-2xl border p-4 text-left transition hover:border-ink",
              hot
                ? "border-amber-300 bg-amber-50/50"
                : "border-line bg-white",
            )}
          >
            <span className="flex items-center justify-between">
              <tile.Icon
                className={cn("size-5", hot ? "text-amber-700" : "text-mute")}
                aria-hidden
              />
              <b
                className={cn(
                  "tnum text-[24px] font-extrabold",
                  !hot && "text-mute",
                )}
              >
                {tile.count}
              </b>
            </span>
            <b className="text-[14.5px]">{tile.label}</b>
            <span className="text-[12.5px] leading-snug text-mute">
              {tile.hint}
            </span>
          </Link>
        )
      })}
    </div>
  </section>
)

export const QUEUE_ICONS = {
  companies: Building2,
  catalog: Boxes,
  reports: Flag,
  changes: RefreshCw,
  chats: MessageSquare,
  disputes: Scale,
  payouts: Landmark,
} as const
