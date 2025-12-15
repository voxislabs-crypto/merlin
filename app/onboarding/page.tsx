"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, User, Calendar, MapPin, Brain } from "lucide-react"

interface OnboardingData {
  fullName: string
  birthDate: string
  birthTime: string
  birthLocation: string
  timeUnknown: boolean
  mbti: string
}

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP"
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    timeUnknown: false,
    mbti: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const updateData = (field: keyof OnboardingData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // TODO: Save to Supabase
      console.log("Saving onboarding data:", data)
      // Redirect to dashboard after successful save
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error saving onboarding data:", error)
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
      default:
        return false
    }
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Merlin</CardTitle>
          <CardDescription>
            Let's set up your personalized astrological profile
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Step {step} of 3</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Tell us your name</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={data.fullName}
                  onChange={(e) => updateData("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Birth Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={data.birthDate}
                  onChange={(e) => updateData("birthDate", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthTime">Birth Time</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={data.birthTime}
                  onChange={(e) => updateData("birthTime", e.target.value)}
                  disabled={data.timeUnknown}
                  className="w-full"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="timeUnknown"
                    checked={data.timeUnknown}
                    onChange={(e) => updateData("timeUnknown", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="timeUnknown" className="text-sm">
                    I don't know my birth time
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthLocation">Birth Location</Label>
                <Input
                  id="birthLocation"
                  value={data.birthLocation}
                  onChange={(e) => updateData("birthLocation", e.target.value)}
                  placeholder="City, Country"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Personality Type</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mbti">MBTI Type</Label>
                <Select value={data.mbti} onValueChange={(value) => updateData("mbti", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your MBTI type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MBTI_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  Don't know your MBTI type? You can take a quick assessment online or choose one that feels right.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            {step === 3 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex items-center space-x-2"
              >
                <span>Complete</span>
                {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center space-x-2"
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
