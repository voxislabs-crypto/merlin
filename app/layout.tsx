import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { EphemerisStatusBanner } from "../components/EphemerisStatusBanner"
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

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
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          footerActionLink: 'text-primary hover:text-primary/80',
          formFieldInput: 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
          formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground',
          formFieldInputPassword: 'pr-10',
          formFieldInputShowPasswordIcon: 'h-5 w-5',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      <html lang="en">
        <body className={fontVariables.className}>
          <Toaster position="top-center" />
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
    </ClerkProvider>
  )
}

