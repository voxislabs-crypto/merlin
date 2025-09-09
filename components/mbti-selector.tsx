"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserIcon, BrainIcon, HeartIcon, EyeIcon } from "lucide-react"
import { MBTI_TYPES, MBTI_PROFILES, type MBTIType } from "@/lib/mbti-system"

interface MBTISelectorProps {
  selectedType?: MBTIType
  onTypeSelect: (type: MBTIType) => void
  onComplete: () => void
}

export function MBTISelector({ selectedType, onTypeSelect, onComplete }: MBTISelectorProps) {
  const [showDetails, setShowDetails] = useState(false)

  const selectedProfile = selectedType ? MBTI_PROFILES[selectedType] : null

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-[family-name:var(--font-montserrat)] font-bold">
            Add Your Personality Type
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enhance your cosmic guidance with personalized insights based on your MBTI type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Your MBTI Type</label>
            <Select value={selectedType} onValueChange={(value) => onTypeSelect(value as MBTIType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your personality type..." />
              </SelectTrigger>
              <SelectContent>
                {MBTI_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{type}</span>
                      <span className="text-muted-foreground">- {MBTI_PROFILES[type].name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProfile && (
            <Card className="bg-muted/30 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedProfile.type}</CardTitle>
                    <CardDescription>{selectedProfile.name}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? "Hide" : "Show"} Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-pretty">{selectedProfile.description}</p>

                {showDetails && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BrainIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Strengths</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedProfile.strengths.map((strength, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <HeartIcon className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">Growth Areas</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedProfile.challenges.map((challenge, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {challenge}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <EyeIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Cosmic Tendencies</span>
                      </div>
                      <ul className="space-y-1">
                        {selectedProfile.cosmicTendencies.map((tendency, index) => (
                          <li key={index} className="text-xs text-muted-foreground pl-4">
                            • {tendency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onComplete} className="flex-1 bg-transparent">
              Skip for Now
            </Button>
            <Button
              onClick={onComplete}
              disabled={!selectedType}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Save & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
