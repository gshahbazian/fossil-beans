import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { IBM_Plex_Mono } from 'next/font/google'
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

const inter = Inter({ subsets: ['latin'] })
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} ${ibmPlexMono.variable}`}>
      <body className="overflow-x-hidden">{children}</body>
    </html>
  )
}
