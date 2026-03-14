import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/General/navbar'
import Footer from '@/components/General/footer'
import { Toaster } from '@/components/ui/sonner'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MeetUp — Schedule smarter',
  description:
    'Meetings, tasks, and training programs in one place — with automated reminders on West Africa Time.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang='en'
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>
          <main>{children}</main>
          <Toaster position='bottom-right' />
        </Providers>
      </body>
    </html>
  )
}
