"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClerkAuth } from '@/utils/clerk/client'
import { SignUp, useUser } from '@clerk/nextjs'
import { StarfieldBackground } from '@/components/cosmic/StarfieldBackground'
import { GlassmorphicCard } from '@/components/cosmic/GlassmorphicCard'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function SignUpPage() {
  const { isSignedIn, userId } = useClerkAuth()
  const router = useRouter()

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push('/onboarding')
    }
  }, [isSignedIn, router])

  if (isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <StarfieldBackground />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/">
          <motion.button
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </motion.button>
        </Link>

        <GlassmorphicCard className="p-8" glow="cosmic">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-primary to-secondary cosmic-glow-static mb-4"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-3xl font-serif font-bold mb-2 text-foreground">
              Begin Your Journey
            </h1>
            <p className="text-muted-foreground">
              Create your account to unlock cosmic insights
            </p>
          </div>

          <SignUp
            path="/signup"
            routing="path"
            signInUrl="/login"
            redirectUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent border-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "glass-card border-border/50 hover:border-primary bg-input text-foreground",
                formButtonPrimary: "cosmic-button bg-primary text-white hover:bg-primary/90",
                formFieldLabel: "text-foreground",
                formFieldInput: "glass-card border-border/50 focus:border-primary bg-input text-foreground placeholder:text-muted-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
              }
            }}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </GlassmorphicCard>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to Merlin's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
