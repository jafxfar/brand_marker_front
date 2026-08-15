import { cn } from "@/lib/utils"

type PageFrameProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  className?: string
}

export const PageFrame = ({ children, className, ...props }: PageFrameProps) => {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl space-y-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}
