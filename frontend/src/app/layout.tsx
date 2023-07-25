import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import GoogleAnalytics from '../components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '5lnk.live - URL Shortener',
  description: 'Free URL shortener service built with Golang and Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_ANALYTICS_ID ? (
        <GoogleAnalytics ga_id = {process.env.NEXT_PUBLIC_ANALYTICS_ID} />
      ): null}
      <body className={inter.className}>{children}</body>
    </html>
  )
}
