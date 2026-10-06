import type { Metadata } from 'next'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL("https://brand-marker-front.vercel.app"),
  title: "БрендМаркет — B2B Маркетплейс услуг",
  description:
    "Крупнейшая таджикская B2B платформа для поиска и заказа бизнес-услуг. ИТ, маркетинг, юриспруденция, логистика, консалтинг и тысячи других услуг.",
  generator: "v0.app",
  openGraph: {
    title: "БрендМаркет — B2B Маркетплейс услуг",
    description:
      "Крупнейшая таджикская B2B платформа для поиска и заказа бизнес-услуг. ИТ, маркетинг, юриспруденция, логистика, консалтинг и тысячи других услуг.",
    url: "https://brand-marker-front.vercel.app",
    siteName: "БрендМаркет",
    locale: "ru_TJ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "БрендМаркет — B2B Маркетплейс услуг",
    description:
      "Крупнейшая таджикская B2B платформа для поиска и заказа бизнес-услуг.",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="bg-background">
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
