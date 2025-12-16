"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StarfieldBackground } from '@/components/cosmic/StarfieldBackground'
import { GlassmorphicCard } from '@/components/cosmic/GlassmorphicCard'
import { CosmicButton } from '@/components/cosmic/CosmicButton'
import { Sparkles, TrendingUp, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const hasCompleted = localStorage.getItem('hasCompletedOnboarding')
    const savedBirthData = localStorage.getItem('birthData')
    
    if (hasCompleted !== 'true') {
      router.push('/login')
      return
    }
    
    if (savedBirthData) {
      try {
        const data = JSON.parse(savedBirthData)
        setUserName(data.fullName || 'Seeker')
      } catch (error) {
        console.error('Error parsing birth data:', error)
      }
    }
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('hasCompletedOnboarding')
    localStorage.removeItem('birthData')
    router.push('/')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarfieldBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Welcome back, {userName}
            </h1>
            <p className="text-muted-foreground">Your cosmic intelligence is ready</p>
          </div>
          <div className="flex items-center gap-2">
            <CosmicButton variant="ghost" size="sm" onClick={() => router.push('/settings')}>
              <Settings className="w-4 h-4" />
            </CosmicButton>
            <CosmicButton variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </CosmicButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Primary Theme Card */}
          <GlassmorphicCard className="lg:col-span-2 p-8" glow="cosmic">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Today's Primary Focus</h2>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-primary mb-2">☽ □ ♄</div>
              <p className="text-sm text-muted-foreground">Moon Square Saturn</p>
            </div>

            <div className="p-6 rounded-lg bg-primary/10 border border-primary/30">
              <h3 className="text-lg font-semibold text-primary mb-3">Theme: Relationships</h3>
              <p className="text-foreground mb-4 italic">
                "Trust your intuition about this relationships focus today."
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-accent mb-2">✅ Do</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Trust your instincts</li>
                    <li>• Communicate clearly</li>
                    <li>• Set gentle boundaries</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-destructive mb-2">❌ Don't</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Overthink decisions</li>
                    <li>• Ignore your feelings</li>
                    <li>• Rush important choices</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <div className="text-3xl font-bold text-secondary">88%</div>
              <div className="text-xs text-muted-foreground">Confidence Score</div>
            </div>
          </GlassmorphicCard>

          {/* Resonance Intelligence */}
          <GlassmorphicCard className="p-6" glow="neon">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-serif font-bold text-foreground">Resonance Intelligence</h3>
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-accent/10">
                <div className="text-4xl font-bold text-accent mb-1">92%</div>
                <div className="text-xs text-muted-foreground">Overall Accuracy</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary mb-1">12</div>
                <div className="text-xs text-muted-foreground">Day Learning Streak</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-secondary/10">
                <div className="text-2xl font-bold text-secondary mb-1">3</div>
                <div className="text-xs text-muted-foreground">Active Aspects</div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Cosmic Utilities */}
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground mb-4">Cosmic Utilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🔮', title: 'Ask Merlin', desc: 'Get instant cosmic guidance' },
              { icon: '📊', title: 'View Chart', desc: 'See your natal chart' },
              { icon: '📅', title: 'Forecast', desc: 'Weekly predictions' },
              { icon: '⚙️', title: 'Settings', desc: 'Manage your profile' },
            ].map((utility) => (
              <GlassmorphicCard
                key={utility.title}
                className="p-6 text-center cursor-pointer"
                hover
              >
                <div className="text-4xl mb-3">{utility.icon}</div>
                <h4 className="font-semibold text-foreground mb-1">{utility.title}</h4>
                <p className="text-xs text-muted-foreground">{utility.desc}</p>
              </GlassmorphicCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}