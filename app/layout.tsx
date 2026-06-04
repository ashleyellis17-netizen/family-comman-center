import type { Metadata, Viewport } from 'next'
import { Nunito, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navigation } from '@/components/navigation'

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
  title: 'Theveny Boys',
  description: 'Family dashboard for Alex, Jaxon, and Carson',
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
  themeColor: '#f5f0e8',
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
      <body className={`${nunito.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}>
        {/* Boho background pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Warm gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-background to-orange-50/30" />
          
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-alex/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-24 w-80 h-80 bg-gradient-to-br from-jaxon/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-gradient-to-br from-carson/10 to-transparent rounded-full blur-3xl" />
          
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 boho-dots opacity-50" />
        </div>
        
        <div className="flex min-h-screen">
          <Navigation />
          <div className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="p-4 text-center text-sm text-muted-foreground/70 font-medium">
              Theveny Family Command Center
            </footer>
          </div>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
