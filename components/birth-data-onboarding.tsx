"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, MapPinIcon, ClockIcon } from "lucide-react"

interface BirthData {
  fullName: string
  birthDate: string
  birthTime: string
  birthLocation: string
  timeUnknown: boolean
}

interface BirthDataOnboardingProps {
  userName: string
  onComplete: (birthData: BirthData) => void
}

const BirthDataOnboarding = ({ userName, onComplete }: BirthDataOnboardingProps) => {
  const [birthData, setBirthData] = useState<BirthData>({
    fullName: userName,
    birthDate: "",
    birthTime: "12:00",
    birthLocation: "",
    timeUnknown: false,
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate chart generation
    setTimeout(() => {
      onComplete(birthData)
      setIsGenerating(false)
    }, 3000)
  }

  const handleInputChange = (field: keyof BirthData, value: string | boolean) => {
    setBirthData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Animated constellation background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse mx-auto mb-4"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden cosmic-glow">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-18BDsYIF1lM1wFutWjX4QbkjPacL5R.png"
              alt="Merlin Astrology App Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Your Birth Chart Unlocks Merlin</h1>
          <p className="text-muted-foreground text-lg">
            Astrology starts with your unique cosmic blueprint. Tell Merlin when and where you entered the world.
          </p>
        </div>

        {isGenerating ? (
          <Card className="border-2 border-primary/30 cosmic-glow relative z-10">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Generating Your Birth Chart</h3>
                <p className="text-muted-foreground">Calculating planetary positions and cosmic influences...</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>Mapping celestial bodies at your birth moment</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-2 h-2 bg-secondary rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <span>Calculating house positions and aspects</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
                  <span>Preparing your personalized forecasts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-primary/30 cosmic-glow relative z-10">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Enter Your Birth Information</CardTitle>
              <CardDescription>This sacred information creates your cosmic fingerprint</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                    <span>✨</span> Full Name (Optional)
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={birthData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Your full name"
                    className="cosmic-glow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> Birth Date
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="cosmic-glow"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthTime" className="text-sm font-medium flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" /> Birth Time
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={birthData.birthTime}
                    onChange={(e) => handleInputChange("birthTime", e.target.value)}
                    className="cosmic-glow"
                    disabled={birthData.timeUnknown}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="timeUnknown"
                      checked={birthData.timeUnknown}
                      onCheckedChange={(checked) => handleInputChange("timeUnknown", checked as boolean)}
                    />
                    <Label htmlFor="timeUnknown" className="text-sm text-muted-foreground">
                      Exact time unknown (will use noon chart)
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthLocation" className="text-sm font-medium flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" /> Birth Location
                  </Label>
                  <Input
                    id="birthLocation"
                    type="text"
                    value={birthData.birthLocation}
                    onChange={(e) => handleInputChange("birthLocation", e.target.value)}
                    placeholder="City, State/Country (e.g., Norfolk, Virginia)"
                    className="cosmic-glow"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cosmic-glow text-lg py-6"
                  disabled={!birthData.birthDate || !birthData.birthLocation}
                >
                  <span className="flex items-center gap-2">
                    <span>🌟</span>
                    Generate My Chart
                  </span>
                </Button>
              </form>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground text-center">
                  Your birth information is encrypted and used only to calculate your astrological chart. Merlin
                  respects your cosmic privacy.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default BirthDataOnboarding
