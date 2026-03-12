import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { LanguageProvider } from '@/lib/contexts/LanguageContext'
import { CvDataProvider } from '@/lib/contexts/CvDataContext'
import SessionProvider from '@/components/providers/SessionProvider'
import LayoutClient from './layout-client'

export const metadata: Metadata = {
  title: 'CVin - Professional CV Builder',
  description: 'Build ATS-friendly CVs with AI-powered suggestions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <LanguageProvider>
            <AuthProvider>
              <CvDataProvider>
                <LayoutClient>
                  {children}
                </LayoutClient>
              </CvDataProvider>
            </AuthProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
