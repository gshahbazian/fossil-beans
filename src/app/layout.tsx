import '@/styles/globals.css'
import { Geist } from 'next/font/google'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fossil Beans',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const giest = Geist({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${giest.className}`}>
      <body>{children}</body>
    </html>
  )
}
