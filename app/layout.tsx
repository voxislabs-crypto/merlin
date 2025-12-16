import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { EphemerisStatusBanner } from "../components/EphemerisStatusBanner"

// Cosmic fonts loaded via Google Fonts CDN in globals.css
const fontVariables = {
  variable: "--font-sans",
  className: "font-sans"
}

export const metadata: Metadata = {
  title: "Merlin - AI Personal Assistant",
  description:
    "Your AI-powered personal assistant for enhanced productivity. Chat, analyze documents, search the web, and generate images.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={fontVariables.className}>
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <EphemerisStatusBanner />
          </div>
        )}
        <Suspense fallback={null}>
          <div className={process.env.NODE_ENV === 'development' ? 'pt-16' : ''}>
            {children}
          </div>
        </Suspense>
      </body>
    </html>
  )
}
