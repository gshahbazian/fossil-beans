import '@/styles/globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fossil Beans',
  icons: {
    icon: '/icon.png',
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
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
