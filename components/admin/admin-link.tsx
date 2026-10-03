"use client"

import Link from "next/link"
import { canAccessAdminPath } from "@/lib/admin-permissions"
import { useAuthStore } from "@/lib/store/auth-store"

type AdminLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string
  /** Render nothing instead of plain text when the section is not accessible. */
  hideWhenDenied?: boolean
  fallbackClassName?: string
}

export const AdminLink = ({
  href,
  hideWhenDenied = false,
  fallbackClassName,
  children,
  ...props
}: AdminLinkProps) => {
  const canAccess = useAuthStore((state) => canAccessAdminPath(state.user, href))

  if (canAccess) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  if (hideWhenDenied) return null

  return <span className={fallbackClassName}>{children}</span>
}
