import { Card, CardContent } from "@/components/ui/card"

type MoonPhaseProps = {
  date: Date
  latitude: number
  longitude: number
}

export function MoonPhaseVisualization({ date, latitude, longitude }: MoonPhaseProps) {
  // Calculate moon phase (0 = New Moon, 0.5 = Full Moon, etc.)
  const calculateMoonPhase = (date: Date) => {
    // This is a simplified calculation - in production, use a proper ephemeris
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // Calculate moon phase (0-1)
    const phase = (() => {
      // This is a rough approximation
      const yearFraction = (year - 2000) * 12.3685
      const monthFraction = (month - 1) * 0.0833
      const dayFraction = day / 30
      return (yearFraction + monthFraction + dayFraction) % 1
    })()
    
    return phase
  }
  
  const phase = calculateMoonPhase(date)
  
  // Determine phase name
  const getPhaseName = (phase: number) => {
    if (phase < 0.03 || phase > 0.97) return 'New Moon'
    if (phase < 0.22) return 'Waxing Crescent'
    if (phase < 0.28) return 'First Quarter'
    if (phase < 0.47) return 'Waxing Gibbous'
    if (phase < 0.53) return 'Full Moon'
    if (phase < 0.72) return 'Waning Gibbous'
    if (phase < 0.78) return 'Last Quarter'
    return 'Waning Crescent'
  }
  
  const phaseName = getPhaseName(phase)
  
  // Calculate illumination percentage
  const illumination = Math.round(
    Math.abs(0.5 - Math.abs(phase - 0.5)) * 200
  )
  
  // Calculate moon position in the sky
  const getMoonPosition = () => {
    // This is a simplified calculation
    const hour = date.getHours() + date.getMinutes() / 60
    const position = ((hour / 24) * 360 + 180) % 360 // 0-360 degrees
    return {
      x: 50 + Math.cos((position * Math.PI) / 180) * 40,
      y: 50 + Math.sin((position * Math.PI) / 180) * 40,
    }
  }
  
  const moonPos = getMoonPosition()
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-indigo-100">Moon Phase at Birth</h3>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Moon Phase Visualization */}
          <div className="relative w-48 h-48 rounded-full border-2 border-indigo-500/30 p-1">
            <div 
              className="absolute inset-0 rounded-full bg-gray-800/50"
              style={{
                background: `radial-gradient(circle at ${phase * 100}% 50%, 
                  transparent 0%, 
                  transparent 48%, 
                  rgba(99, 102, 241, 0.2) 50%, 
                  rgba(99, 102, 241, 0.1) 100%)`
              }}
            >
              <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
                <div className="text-4xl">
                  {phase < 0.1 ? '🌑' : 
                   phase < 0.4 ? '🌒' : 
                   phase < 0.6 ? '🌓' : 
                   phase < 0.9 ? '🌔' : '🌕'}
                </div>
              </div>
            </div>
            
            {/* Moon position in the sky */}
            <div 
              className="absolute w-3 h-3 rounded-full bg-yellow-400 shadow-lg"
              style={{
                left: `${moonPos.x}%`,
                top: `${moonPos.y}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 15px rgba(250, 204, 21, 0.7)'
              }}
            />
          </div>
          
          {/* Phase Details */}
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-indigo-300">Phase</h4>
                <p className="text-xl font-semibold">{phaseName}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-indigo-300">Illumination</h4>
                <div className="w-full bg-gray-800 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-indigo-500 h-2.5 rounded-full" 
                    style={{ width: `${illumination}%` }}
                  />
                </div>
                <p className="text-sm text-right mt-1">{illumination}%</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-indigo-300">Influence</h4>
                <p className="text-sm text-gray-300">
                  {getPhaseInfluence(phaseName)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getPhaseInfluence(phaseName: string): string {
  const influences: Record<string, string> = {
    'New Moon': 'A time of new beginnings and setting intentions. Your birth during this phase suggests strong intuitive abilities and a natural talent for starting new projects.',
    'Waxing Crescent': 'A period of growth and building energy. You likely have a natural ability to develop ideas and see them through to completion.',
    'First Quarter': 'A time of action and overcoming challenges. You probably have a strong will and determination to achieve your goals.',
    'Waxing Gibbous': 'A phase of refinement and adjustment. You may have a keen eye for detail and a desire to perfect your work.',
    'Full Moon': 'A time of culmination and heightened emotions. Your birth during this phase suggests strong emotional intelligence and the ability to see multiple perspectives.',
    'Waning Gibbous': 'A period of sharing knowledge and giving back. You likely have a natural teaching ability and a desire to help others.',
    'Last Quarter': 'A time of release and letting go. You may have a talent for helping others through transitions and transformations.',
    'Waning Crescent': 'A phase of rest and preparation. You probably have strong intuitive abilities and a connection to the spiritual realm.'
  }
  
  return influences[phaseName] || 'The moon phase at your birth influences your emotional nature and intuitive abilities.'
}
