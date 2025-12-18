import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type MoonSignProps = {
  sign: string
  degree: number
  minute: number
  second: number
}

const MOON_INTERPRETATIONS = {
  Scorpio: {
    title: "Scorpio Moon",
    traits: [
      "Intense emotional depth and intuition",
      "Strong willpower and determination",
      "Passionate and transformative nature",
      "Excellent at reading people and situations",
      "Tendency towards emotional secrecy"
    ],
    description: "With your Moon in Scorpio, you experience emotions with profound depth and intensity. Your emotional world is complex and transformative, often going through powerful emotional evolutions throughout your life. You have a natural ability to sense what others are feeling, sometimes even before they're aware of it themselves."
  },
  // Other signs would be added here
} as const

export function MoonSignInterpretation({ sign, degree, minute, second }: MoonSignProps) {
  const interpretation = MOON_INTERPRETATIONS[sign as keyof typeof MOON_INTERPRETATIONS]
  
  if (!interpretation) return null

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl">{interpretation.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {degree}° {minute}' {second}" - {sign}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-4">{interpretation.description}</p>
          
          <h3 className="font-medium mb-2">Key Traits:</h3>
          <ul className="space-y-2">
            {interpretation.traits.map((trait, i) => (
              <li key={i} className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>{trait}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Moon Phase:</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/20" style={{
                clipPath: 'polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 0)'
              }} />
              <div className="absolute inset-0.5 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-xs font-mono">Waxing</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Your moon was in a <span className="text-indigo-400">Waxing Crescent</span> phase</p>
              <p className="text-xs">(Approx. 5 days after New Moon)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
