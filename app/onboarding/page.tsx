"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, User, Calendar, MapPin, Brain, Sparkles, Moon, Star } from "lucide-react"
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
      console.log("Redirecting to main app...")
      window.location.href = "/"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      </div>
      
      <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader className="text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
            Welcome to Merlin
          </CardTitle>
          <CardDescription className="text-purple-200">
            Your personal cosmic oracle awaits
          </CardDescription>
          <div className="mt-6">
            <Progress value={progress} className="w-full h-2 bg-white/20" />
            <p className="text-sm text-purple-200 mt-2">Step {step} of 4</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-white">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-full">
                  <User className="h-6 w-6 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-purple-200">Your Cosmic Identity</h3>
              </div>
              <div className="space-y-4">
                <Label htmlFor="fullName" className="text-purple-200 text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  value={data.fullName}
                  onChange={(e) => updateData("fullName", e.target.value)}
                  placeholder="Enter your cosmic name"
                  className="w-full bg-white/10 border-white/20 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400"
                />
                <p className="text-xs text-purple-300">This name will be used to personalize your cosmic readings</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-blue-200">Birth Celestial Alignment</h3>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="birthDate" className="text-blue-200 text-sm font-medium">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={data.birthDate}
                  onChange={(e) => updateData("birthDate", e.target.value)}
                  className="w-full bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="birthTime" className="text-blue-200 text-sm font-medium">Birth Time</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={data.birthTime}
                  onChange={(e) => updateData("birthTime", e.target.value)}
                  disabled={data.timeUnknown}
                  className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-blue-400 focus:ring-blue-400 disabled:opacity-50"
                />
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="timeUnknown"
                    checked={data.timeUnknown}
                    onChange={(e) => updateData("timeUnknown", e.target.checked)}
                    className="rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-400"
                  />
                  <Label htmlFor="timeUnknown" className="text-sm text-blue-300">
                    I don't know my birth time
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

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center space-x-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            {step === 2 ? (
              <Button
                onClick={handleStep2Complete}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : step === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <span>Complete Journey</span>
                {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
