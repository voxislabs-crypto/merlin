"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SettingsIcon,
  TrendingUpIcon,
  FlameIcon,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { assignThemes, themeDetails, type ThemeAssignment } from "@/lib/themes"
import { detectAspects } from "@/lib/aspects"
import { getAllPositions } from "@/lib/ephemeris"

interface User {
  id: string
  email: string
  name: string
}

interface BirthData {
  fullName: string
  birthDate: string
  birthTime: string
  birthLocation: string
  timeUnknown: boolean
}

export default function MerlinApp() {
  const [user, setUser] = useState<User | null>(null)
  const [birthData, setBirthData] = useState<BirthData | null>(null)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [currentView, setCurrentView] = useState<string>("dashboard")
  const [themeAssignment, setThemeAssignment] = useState<ThemeAssignment | null>(null)

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    if (hasCompletedOnboarding && birthData) {
      // Get planetary positions and aspects
      const positions = getAllPositions(new Date(), birthData.birthLocation)
      const aspects = detectAspects(positions)

      // Mock resonance stats (in production, this would come from database)
      const mockResonanceStats = {
        relationships: 0.8,
        career: 0.6,
        innerWork: 0.4,
        communication: 0.7,
        finance: 0.5,
      }

      // Assign themes with prioritization
      const assignment = assignThemes(aspects, undefined, mockResonanceStats)
      setThemeAssignment(assignment)
    }
  }, [hasCompletedOnboarding, birthData])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const mockUser: User = {
        id: "1",
        email: email,
        name: authMode === "signup" ? name : email.split("@")[0],
      }
      setUser(mockUser)
      if (authMode === "signin") {
        setHasCompletedOnboarding(true)
        setBirthData({
          fullName: mockUser.name,
          birthDate: "1990-08-14",
          birthTime: "14:30",
          birthLocation: "Norfolk, Virginia",
          timeUnknown: false,
        })
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleSignOut = () => {
    setUser(null)
    setBirthData(null)
    setHasCompletedOnboarding(false)
    setEmail("")
    setPassword("")
    setName("")
    setCurrentView("dashboard")
    setThemeAssignment(null)
  }

  if (user && hasCompletedOnboarding && currentView === "dashboard" && themeAssignment) {
    const primaryTheme = themeAssignment.primaryTheme
    const primaryDetails = themeDetails[primaryTheme.theme]

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-18BDsYIF1lM1wFutWjX4QbkjPacL5R.png"
                alt="Merlin Logo"
                className="w-12 h-12 rounded-xl cosmic-glow"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
                <p className="text-sm text-muted-foreground">Your cosmic intelligence is ready</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("settings")}
                className="text-muted-foreground hover:text-foreground"
              >
                <SettingsIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-semibold text-foreground">Primary Focus</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center cursor-help">
                      <span className="text-xs text-primary">?</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Your strongest astrological influence today based on aspect strength, orb tightness, and personal
                      resonance.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Card
              className={`border-2 border-${primaryDetails.color === "red" ? "destructive" : primaryDetails.color === "yellow" ? "yellow-500" : "green-500"}/30 bg-gradient-to-br from-card to-${primaryDetails.color === "red" ? "destructive" : primaryDetails.color === "yellow" ? "yellow-500" : "green-500"}/5 cosmic-glow`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 bg-${primaryDetails.color === "red" ? "destructive" : primaryDetails.color === "yellow" ? "yellow-500" : "green-500"} rounded-full animate-pulse`}
                    ></div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CardTitle
                            className={`text-xl text-${primaryDetails.color === "red" ? "destructive" : primaryDetails.color === "yellow" ? "yellow-600" : "green-600"} cursor-help`}
                          >
                            {primaryDetails.emoji} Theme: {primaryDetails.name}
                          </CardTitle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{primaryDetails.description}</p>
                          <p className="text-xs mt-1 opacity-80">{primaryTheme.explanation}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <div className="text-2xl font-bold text-secondary">{primaryTheme.score}%</div>
                            <div className="text-xs text-muted-foreground">Confidence</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Blends orb tightness, system agreement, and resonance data into one reliability score.</p>
                          {primaryTheme.resonanceBoost > 0 && (
                            <p className="text-xs mt-1 text-green-400">
                              +{primaryTheme.resonanceBoost}% resonance boost
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {primaryTheme.sourceAspects[0] || "☽ □ ♄"}
                  </div>
                  <div className="text-sm text-muted-foreground">Primary Aspect</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`bg-gradient-to-r from-${primaryDetails.color === "red" ? "destructive" : primaryDetails.color === "yellow" ? "yellow-500" : "green-500"}/10 to-${primaryDetails.color === "red" ? "destructive" : primaryDetails.color === "yellow" ? "yellow-500" : "green-500"}/5 p-4 rounded-lg border border-${primaryDetails.color === "red" ? "destructive" : primaryDetails.color === "yellow" ? "yellow-500" : "green-500"}/20`}
                >
                  <div
                    className={`text-sm font-semibold text-${primaryDetails.color === "red" ? "destructive" : primaryDetails.color === "yellow" ? "yellow-600" : "green-600"} mb-2`}
                  >
                    INFJ Overlay:
                  </div>
                  <p className="text-base text-foreground italic mb-3">
                    "Trust your intuition about this {primaryDetails.name.toLowerCase()} focus today."
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-secondary flex items-center gap-2">
                        <span>✅</span> Do
                      </h4>
                      <ul className="text-sm space-y-1 text-foreground/80">
                        <li>• Trust your instincts</li>
                        <li>• Take thoughtful action</li>
                        <li>• Communicate clearly</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-accent flex items-center gap-2">
                        <span>❌</span> Don't
                      </h4>
                      <ul className="text-sm space-y-1 text-foreground/80">
                        <li>• Overthink decisions</li>
                        <li>• Ignore your feelings</li>
                        <li>• Rush important choices</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {themeAssignment.supportingThemes.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-foreground">Supporting Influences</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-4 h-4 bg-muted rounded-full flex items-center justify-center cursor-help">
                        <span className="text-xs text-muted-foreground">?</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Secondary themes with significant influence but lower priority than your primary focus.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themeAssignment.supportingThemes.map((supportingTheme, index) => {
                  const details = themeDetails[supportingTheme.theme]
                  return (
                    <Card key={index} className="border border-muted hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CardTitle className="text-sm cursor-help flex items-center gap-2">
                                  {details.emoji} {details.name}
                                </CardTitle>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{details.description}</p>
                                <p className="text-xs mt-1 opacity-80">{supportingTheme.explanation}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="text-sm font-bold text-muted-foreground">{supportingTheme.score}%</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {supportingTheme.sourceAspects[0] || "Supporting aspect"}
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Today's Deep Dive</h3>
            <div className="space-y-6">
              <Card className="border-2 border-destructive/30 bg-gradient-to-br from-card to-destructive/5 cosmic-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CardTitle className="text-xl text-destructive cursor-help">
                              🔴 Theme: Relationships
                            </CardTitle>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Focuses on love, friendships, and close connections — how emotions and bonds are tested or
                              supported today.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-secondary">88%</div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="text-4xl font-bold text-destructive mb-2">☽ □ ♄</div>
                    <div className="text-sm text-muted-foreground">Moon Square Saturn</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 p-4 rounded-lg border border-destructive/20">
                    <div className="text-sm font-semibold text-destructive mb-2">INFJ Overlay:</div>
                    <p className="text-base text-foreground italic mb-3">
                      "Don't retreat into silence. Speak gently, even if it feels hard."
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-secondary flex items-center gap-2">
                          <span>✅</span> Do
                        </h4>
                        <ul className="text-sm space-y-1 text-foreground/80">
                          <li>• Honest communication</li>
                          <li>• Trust intuitive insights</li>
                          <li>• Set gentle boundaries</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-accent flex items-center gap-2">
                          <span>❌</span> Don't
                        </h4>
                        <ul className="text-sm space-y-1 text-foreground/80">
                          <li>• Demanding perfection</li>
                          <li>• Classic INFJ "door slam"</li>
                          <li>• Over-analyzing responses</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5" />
              Resonance Intelligence
            </h3>
            <Card className="solar-glow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary mb-2">{themeAssignment.confidence}%</div>
                    <div className="text-sm text-muted-foreground">Overall forecast confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground mb-2">
                      {primaryTheme.sourceAspects.length} aspects
                    </div>
                    <div className="text-sm text-muted-foreground">Contributing to primary theme</div>
                  </div>
                  <div className="text-center flex items-center justify-center gap-2">
                    <FlameIcon className="w-5 h-5 text-destructive" />
                    <div>
                      <div className="text-lg font-bold text-destructive">12</div>
                      <div className="text-sm text-muted-foreground">Day learning streak</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Cosmic Utilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-all cursor-pointer border border-primary/30 hover:border-primary/50">
                <CardHeader className="text-center pb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg">🔮</span>
                  </div>
                  <CardTitle className="text-sm">Ask Merlin Anything</CardTitle>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-all cursor-pointer border border-secondary/30 hover:border-secondary/50">
                <CardHeader className="text-center pb-4">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg">📂</span>
                  </div>
                  <CardTitle className="text-sm">Upload Birth Chart</CardTitle>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-all cursor-pointer border border-accent/30 hover:border-accent/50">
                <CardHeader className="text-center pb-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg">🌐</span>
                  </div>
                  <CardTitle className="text-sm">Astro Web Insights</CardTitle>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-all cursor-pointer border border-primary/30 hover:border-primary/50">
                <CardHeader className="text-center pb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg">⭐</span>
                  </div>
                  <CardTitle className="text-sm">View Birth Chart</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-18BDsYIF1lM1wFutWjX4QbkjPacL5R.png"
              alt="Merlin Astrology App Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Merlin</h1>
          <p className="text-muted-foreground">Your cosmic oracle for personalized astrology insights</p>
        </div>

        <Card className="border-2 border-primary/30 cosmic-glow">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{authMode === "signin" ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription>
              {authMode === "signin"
                ? "Welcome back! Access your cosmic dashboard"
                : "Join Merlin to unlock personalized astrology forecasts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cosmic-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {authMode === "signin" ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : authMode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {authMode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
