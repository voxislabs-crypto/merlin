"use client";

"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { Sparkles, X } from 'lucide-react';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import type { ResonanceInsightsProps, BirthData } from '@/types/resonance';

export interface UtilityItem {
  icon: string;
  title: string;
  desc: string;
  gradient: string;
  borderColor: string;
}

// Dynamically import components that use browser APIs
const StarfieldBackground = dynamic(
  () => import('@/components/cosmic/StarfieldBackground').then(mod => mod.StarfieldBackground),
  { ssr: false }
);

const BirthChartDisplay = dynamic(
  () => import('@/components/astrology/BirthChartDisplay').then(mod => mod.BirthChartDisplay),
  { ssr: false }
);

const ResonanceInsights = dynamic(
  () => import('@/components/dashboard/ResonanceInsights').then(mod => mod.ResonanceInsights),
  { 
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading insights...</div>
  }
);

const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { ssr: false }
);

export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [showBirthChart, setShowBirthChart] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedBirthData = localStorage.getItem('birthData');
    if (savedBirthData) {
      try {
        setBirthData(JSON.parse(savedBirthData));
      } catch (e) {
        console.error('Failed to parse birth data:', e);
      }
    }
  }, []);

  if (!isLoaded || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }


  const handleViewChart = () => {
    if (birthData) {
      setShowBirthChart(true)
    }
  }

  return (
    <div className="min-h-screen relative">
      {mounted && <StarfieldBackground />}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {mounted && <UserButton afterSignOutUrl="/" />}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Birth Chart Section */}
          {showBirthChart ? (
            <div className="md:col-span-2 lg:col-span-3">
              {birthData && <BirthChartDisplay birthData={birthData} />}
              <button
                onClick={() => setShowBirthChart(false)}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground"
              >
                Hide Birth Chart
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowBirthChart(true)}
              className="md:col-span-2 lg:col-span-3 p-8 border-2 border-dashed rounded-lg text-center hover:bg-accent/10 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">View Birth Chart</h2>
              <p className="text-muted-foreground">Click to see your astrological chart</p>
            </button>
          )}

          {/* Resonance Insights */}
          <div className="md:col-span-2 lg:col-span-3">
            <ResonanceInsights
              userId={user?.id || 'demo-user'}
              birthData={birthData}
            />
          </div>
        </div>

        {/* Enhanced Cosmic Utilities */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-2xl font-serif font-bold text-foreground">Cosmic Utilities</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '🔮',
                title: 'Ask Merlin',
                desc: 'Get instant cosmic guidance',
                gradient: 'from-purple-500/10 to-pink-500/10',
                borderColor: 'border-purple-500/20'
              },
              {
                icon: '📊',
                title: 'View Chart',
                desc: 'See your natal chart',
                gradient: 'from-blue-500/10 to-cyan-500/10',
                borderColor: 'border-blue-500/20'
              },
              {
                icon: '📅',
                title: 'Forecast',
                desc: 'Weekly predictions',
                gradient: 'from-green-500/10 to-emerald-500/10',
                borderColor: 'border-green-500/20'
              },
              {
                icon: '⚙️',
                title: 'Settings',
                desc: 'Manage your profile',
                gradient: 'from-orange-500/10 to-red-500/10',
                borderColor: 'border-orange-500/20'
              },
            ].map((utility) => (
              <GlassmorphicCard
                key={utility.title}
                className={`p-6 text-center cursor-pointer bg-linear-to-br ${utility.gradient} border ${utility.borderColor} hover:scale-105 transition-all duration-300 hover:shadow-lg`}
                hover
                onClick={utility.title === 'View Chart' ? handleViewChart : undefined}
              >
                <div className="text-5xl mb-3 filter drop-shadow-sm">{utility.icon}</div>
                <h4 className="font-semibold text-foreground mb-2 text-sm">{utility.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{utility.desc}</p>
              </GlassmorphicCard>
            ))}
          </div>
        </div>

        {/* Birth Chart Modal */}
        {showBirthChart && birthData && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Birth Chart</h2>
                <button onClick={() => setShowBirthChart(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                {birthData && <BirthChartDisplay birthData={birthData} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}