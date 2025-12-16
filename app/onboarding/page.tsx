"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StarfieldBackground } from '@/components/cosmic/StarfieldBackground'
import { GlassmorphicCard } from '@/components/cosmic/GlassmorphicCard'
import { CosmicButton } from '@/components/cosmic/CosmicButton'
import { LoadingOracle } from '@/components/cosmic/LoadingOracle'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, User, Calendar, MapPin, Brain, Sparkles, Moon, Star, ArrowLeft, ArrowRight } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface OnboardingData {
  fullName: string
  birthDate: string
  birthTime: string
  birthLocation: string
  timeUnknown: boolean
  mbti: string
  zodiacSign?: string
  risingSign?: string
  moonSign?: string
  lifePathNumber?: string
}

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP"
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    timeUnknown: false,
    mbti: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [calculatedSigns, setCalculatedSigns] = useState<{ sun: string, rising: string, moon: string } | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('User not authenticated, redirecting to login')
          router.push('/login')
          return
        }
        
        // Check if user already completed onboarding
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        // Only redirect if profile exists and we're not in the middle of completing onboarding
        if (profile && !isLoading) {
          console.log('User already completed onboarding, redirecting to home')
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router, isLoading])

  const updateData = (field: keyof OnboardingData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const calculateZodiacSign = (date: string): string => {
    const birthDate = new Date(date)
    const month = birthDate.getMonth() + 1
    const day = birthDate.getDate()
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries"
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus"
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini"
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer"
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo"
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo"
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra"
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio"
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius"
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn"
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius"
    return "Pisces"
  }

  const calculateLifePathNumber = (date: string): string => {
    const birthDate = new Date(date)
    const day = birthDate.getDate()
    const month = birthDate.getMonth() + 1
    const year = birthDate.getFullYear()
    
    let sum = day + month + year
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0)
    }
    
    return sum.toString()
  }

  const handleStep2Complete = async () => {
    if (data.birthDate) {
      const sunSign = calculateZodiacSign(data.birthDate)
      const lifePath = calculateLifePathNumber(data.birthDate)
      
      // Calculate rising and moon signs if birth time and location are available
      let risingSign = "Unknown"
      let moonSign = "Unknown"
      
      if (!data.timeUnknown && data.birthTime && data.birthLocation) {
        try {
          const response = await fetch('/api/calculate-signs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              birthDate: data.birthDate,
              birthTime: data.birthTime,
              birthLocation: data.birthLocation,
              timeUnknown: data.timeUnknown
            }),
          })
          
          if (response.ok) {
            const result = await response.json()
            risingSign = result.risingSign
            moonSign = result.moonSign
            console.log('Calculated signs:', result)
          } else {
            console.error('Failed to calculate signs:', await response.text())
          }
        } catch (error) {
          console.error('Error calculating signs:', error)
        }
      }
      
      setCalculatedSigns({
        sun: sunSign,
        rising: risingSign,
        moon: moonSign
      })
      
      setData(prev => ({
        ...prev,
        zodiacSign: sunSign,
        risingSign: risingSign,
        moonSign: moonSign,
        lifePathNumber: lifePath
      }))
    }
    nextStep()
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Use Supabase client
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated')
      }
      
      // Save user profile to Supabase
      const profileData = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: data.fullName,
        birth_date: data.birthDate,
        birth_time: data.timeUnknown ? null : data.birthTime,
        birth_location: data.birthLocation,
        time_unknown: data.timeUnknown,
        mbti: data.mbti,
        zodiac_sign: data.zodiacSign || null,
        rising_sign: data.risingSign || null,
        moon_sign: data.moonSign || null,
        life_path_number: data.lifePathNumber || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log("Attempting to save profile:", profileData)
      
      const { data: supabaseData, error } = await (supabase as any)
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' })
      
      console.log("Supabase response:", { data: supabaseData, error })
      
      if (error) {
        console.error('Error saving profile:', error)
        alert(`Database error: ${error.message}`)
        return
      }
      
      console.log("Profile saved successfully")
      
      // Refresh session to ensure middleware recognizes the completed profile
      await supabase.auth.refreshSession()
      
      // Store completion in localStorage and redirect to main app
      console.log("Saving to localStorage...")
      localStorage.setItem('hasCompletedOnboarding', 'true')
      localStorage.setItem('birthData', JSON.stringify({
        fullName: data.fullName,
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        birthLocation: data.birthLocation,
        timeUnknown: data.timeUnknown,
        mbti: data.mbti
      }))
      console.log("Redirecting to dashboard...")
      router.push('/dashboard')
      router.refresh() // Force revalidate
    } catch (error: any) {
      console.error("Error saving onboarding data:", error)
      // Show error to user
      alert(error.message || 'Failed to save your profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.fullName.trim().length > 0
      case 2:
        return data.birthDate && data.birthLocation
      case 3:
        return data.mbti.length > 0
      case 4:
        return true // Optional step
      default:
        return false
    }
  }

  const progress = (step / 4) * 100

  if (isLoading && step === 4) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <StarfieldBackground />
        <div className="relative z-10">
          <GlassmorphicCard className="p-12" glow="cosmic">
            <LoadingOracle
              message="Generating Your Birth Chart"
              submessage="Calculating planetary positions and cosmic influences at your birth moment..."
            />
          </GlassmorphicCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <StarfieldBackground />
      
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              Step {step} of 4
            </h2>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <GlassmorphicCard className="p-8" glow="cosmic">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">Your Cosmic Identity</h2>
                  <p className="text-muted-foreground">Let's start with your name</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                <Input
                  id="fullName"
                  value={data.fullName}
                  onChange={(e) => updateData("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="glass-card border-border/50 focus:border-primary bg-input text-foreground"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Your name as it appears on official documents
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">Birth Celestial Alignment</h2>
                  <p className="text-muted-foreground">When and where did you enter this world?</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-foreground">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={data.birthDate}
                  onChange={(e) => updateData("birthDate", e.target.value)}
                  className="glass-card border-border/50 focus:border-primary bg-input text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthTime" className="text-foreground">Birth Time</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={data.birthTime}
                  onChange={(e) => updateData("birthTime", e.target.value)}
                  disabled={data.timeUnknown}
                  className="glass-card border-border/50 focus:border-primary bg-input text-foreground disabled:opacity-50"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="timeUnknown"
                    checked={data.timeUnknown}
                    onCheckedChange={(checked) => updateData("timeUnknown", checked as boolean)}
                  />
                  <Label htmlFor="timeUnknown" className="text-sm text-muted-foreground cursor-pointer">
                    I don't know my exact birth time
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="birthLocation" className="text-blue-200 text-sm font-medium">Birth Location</Label>
                <Input
                  id="birthLocation"
                  value={data.birthLocation}
                  onChange={(e) => updateData("birthLocation", e.target.value)}
                  placeholder="City, Country"
                  className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-blue-400 focus:ring-blue-400"
                />
                <p className="text-xs text-blue-300">Precise location helps calculate your rising sign</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <Brain className="h-6 w-6 text-green-300" />
                </div>
                <h3 className="text-xl font-semibold text-green-200">Personality Matrix</h3>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="mbti" className="text-green-200 text-sm font-medium">MBTI Type</Label>
                <Select value={data.mbti} onValueChange={(value) => updateData("mbti", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-green-400 focus:ring-green-400">
                    <SelectValue placeholder="Select your personality type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    {MBTI_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-white/10">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 rounded-lg border border-white/10">
                <p className="text-sm text-green-200">
                  <Star className="inline h-4 w-4 mr-2" />
                  Your MBTI type helps us understand how you process cosmic energy
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Moon className="h-6 w-6 text-yellow-300" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-200">Your Cosmic Blueprint</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-white/10">
                  <h4 className="text-lg font-semibold text-purple-200 mb-3">Calculated Signs</h4>
                  {calculatedSigns && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-purple-300">Sun Sign:</span>
                        <span className="text-white font-medium">{calculatedSigns.sun}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">Life Path Number:</span>
                        <span className="text-white font-medium">{data.lifePathNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">Rising Sign:</span>
                        <span className="text-white font-medium">{data.risingSign || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">Moon Sign:</span>
                        <span className="text-white font-medium">{data.moonSign || "Unknown"}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 p-4 rounded-lg border border-white/10">
                  <p className="text-sm text-blue-200">
                    <Sparkles className="inline h-4 w-4 mr-2" />
                    Your cosmic profile is ready! Merlin will use this data to provide personalized transit predictions and astrological guidance.
                  </p>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <CosmicButton variant="ghost" onClick={prevStep} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </CosmicButton>
            )}
            {step === 2 ? (
              <CosmicButton
                variant="primary"
                onClick={handleStep2Complete}
                disabled={!canProceed()}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </CosmicButton>
            ) : step === 4 ? (
              <CosmicButton
                variant="primary"
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Completing...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enter the Oracle
                  </>
                )}
              </CosmicButton>
            ) : (
              <CosmicButton
                variant="primary"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </CosmicButton>
            )}
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  )
}
