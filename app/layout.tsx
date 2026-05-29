import type { Metadata, Viewport } from 'next'
import { Nunito, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { MessagesProvider } from '@/lib/messages-context'

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800'],
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Theveny Family Command Center',
  description: 'Household command center for the Theveny family — calendars, chores, summer tasks, rewards, meals, and more.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1c2540',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${nunito.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background`}>
        <MessagesProvider>
          <Navigation />
          <div className="flex min-h-screen flex-col lg:pl-72">
            <main className="flex-1 p-4 pb-28 md:p-6 lg:p-8 lg:pb-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="hidden p-4 text-center text-sm font-medium text-muted-foreground/70 lg:block">
              Theveny Family Command Center
            </footer>
          </div>
        </MessagesProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
