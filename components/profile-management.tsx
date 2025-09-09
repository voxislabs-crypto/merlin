"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  EditIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  FlameIcon,
  ArrowLeftIcon,
} from "lucide-react"

interface BirthData {
  fullName: string
  birthDate: string
  birthTime: string
  birthLocation: string
  timeUnknown: boolean
}

interface User {
  id: string
  email: string
  name: string
}

interface ProfileManagementProps {
  user: User
  birthData?: BirthData
  onBack: () => void
  onUpdateBirthData: (birthData: BirthData) => void
}

export default function ProfileManagement({ user, birthData, onBack, onUpdateBirthData }: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [editData, setEditData] = useState<BirthData>(
    birthData || {
      fullName: user.name,
      birthDate: "",
      birthTime: "12:00",
      birthLocation: "",
      timeUnknown: false,
    },
  )

  const handleSave = async () => {
    setIsRegenerating(true)

    // Simulate chart regeneration
    setTimeout(() => {
      onUpdateBirthData(editData)
      setIsEditing(false)
      setIsRegenerating(false)
    }, 2000)
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)

    // Simulate chart regeneration
    setTimeout(() => {
      setIsRegenerating(false)
    }, 2000)
  }

  const handleInputChange = (field: keyof BirthData, value: string | boolean) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  if (isRegenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="border-2 border-primary/30 cosmic-glow w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Updating Your Chart</h3>
              <p className="text-muted-foreground">Merlin will now align forecasts to your true time & place.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-bold text-foreground">Your Profile</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="border-2 border-primary/30 cosmic-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span>✨</span> Your Profile
                  </CardTitle>
                  <CardDescription>Your cosmic fingerprint and birth information</CardDescription>
                </div>
                {!isEditing && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <EditIcon className="w-4 h-4 mr-2" />
                      Edit Info
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRegenerate}>
                      <RefreshCwIcon className="w-4 h-4 mr-2" />
                      Regenerate Chart
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-2">Update your cosmic fingerprint</h3>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editName" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="editName"
                        value={editData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="cosmic-glow"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editDate" className="text-sm font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> Birth Date
                      </Label>
                      <Input
                        id="editDate"
                        type="date"
                        value={editData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        className="cosmic-glow"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editTime" className="text-sm font-medium flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" /> Birth Time
                      </Label>
                      <Input
                        id="editTime"
                        type="time"
                        value={editData.birthTime}
                        onChange={(e) => handleInputChange("birthTime", e.target.value)}
                        className="cosmic-glow"
                        disabled={editData.timeUnknown}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="editTimeUnknown"
                          checked={editData.timeUnknown}
                          onCheckedChange={(checked) => handleInputChange("timeUnknown", checked as boolean)}
                        />
                        <Label htmlFor="editTimeUnknown" className="text-sm text-muted-foreground">
                          Exact time unknown
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editLocation" className="text-sm font-medium flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" /> Birth Location
                      </Label>
                      <Input
                        id="editLocation"
                        value={editData.birthLocation}
                        onChange={(e) => handleInputChange("birthLocation", e.target.value)}
                        placeholder="City, State/Country"
                        className="cosmic-glow"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-primary/20">
                    <Button onClick={handleSave} className="cosmic-glow">
                      <span className="flex items-center gap-2">
                        <span>🌟</span>
                        Save & Regenerate
                      </span>
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Name</Label>
                      <p className="text-lg font-medium">{birthData?.fullName || user.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Birth Date</Label>
                      <p className="text-lg font-medium">{birthData?.birthDate || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Birth Time</Label>
                      <p className="text-lg font-medium">
                        {birthData?.timeUnknown ? "Unknown (noon chart)" : birthData?.birthTime || "Not set"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Birth Location</Label>
                      <p className="text-lg font-medium">{birthData?.birthLocation || "Not set"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <span>🌌</span> Birth Chart Preview
                      </h4>
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-3 flex items-center justify-center cosmic-glow">
                        <span className="text-2xl">☽</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Full Chart
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personality Overlays */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎭</span> Personality Overlays
              </CardTitle>
              <CardDescription>Active personality frameworks enhancing your forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  INFJ (MBTI)
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  Enneagram 2
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Big 5: High Openness
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                Manage Overlays
              </Button>
            </CardContent>
          </Card>

          {/* Resonance Stats */}
          <Card className="solar-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5" />
                Resonance Stats
              </CardTitle>
              <CardDescription>Your personal accuracy and cosmic alignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">84%</div>
                  <div className="text-sm text-muted-foreground">Lifetime Accuracy</div>
                </div>
                <div className="text-center flex items-center justify-center gap-2">
                  <FlameIcon className="w-5 h-5 text-destructive" />
                  <div>
                    <div className="text-2xl font-bold text-destructive">7</div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground mb-2">☽ ☐ ♄</div>
                  <div className="text-sm text-muted-foreground">Top Aspect (91%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
