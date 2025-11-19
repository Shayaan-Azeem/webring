import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Webring',
  description: 'A webring for students and alumni at the University of Waterloo.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black-900 text-white antialiased">{children}</body>
    </html>
  )
}

