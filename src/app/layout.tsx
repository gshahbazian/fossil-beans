import '@/styles/globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fossil Beans',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
}

const giest = Geist({ subsets: ['latin'] })
const giestMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${giest.className} ${giestMono.variable}`}>
      <body className="overflow-x-hidden">{children}</body>
    </html>
  )
}
