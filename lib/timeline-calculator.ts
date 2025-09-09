import type { MBTIType } from "./mbti-system"

export interface TimelineEvent {
  id: string
  year: number
  month?: number
  title: string
  description: string
  type: "saturn" | "jupiter" | "uranus" | "neptune" | "pluto" | "chiron" | "major"
  intensity: "low" | "medium" | "high"
  theme: string
  advice: string
  mbtiAdvice?: Record<MBTIType, string>
}

export interface YearlyTheme {
  year: number
  title: string
  description: string
  keyEvents: TimelineEvent[]
  overallTone: "challenging" | "growth" | "transformation" | "stability" | "expansion"
  mbtiGuidance?: Record<MBTIType, string>
}

// Mock timeline data - in production this would be calculated from birth data
export function generateTimeline(birthYear: number, mbtiType?: MBTIType): YearlyTheme[] {
  const currentYear = new Date().getFullYear()
  const age = currentYear - birthYear
  const timeline: YearlyTheme[] = []

  for (let year = currentYear; year <= currentYear + 3; year++) {
    const yearAge = year - birthYear
    const events: TimelineEvent[] = []

    // Saturn cycles (every ~29 years)
    if (yearAge % 29 === 0 || Math.abs((yearAge % 29) - 29) <= 1) {
      events.push({
        id: `saturn-${year}`,
        year,
        title: "Saturn Return",
        description: "Major life restructuring and maturity test. Time to build solid foundations.",
        type: "saturn",
        intensity: "high",
        theme: "Responsibility & Structure",
        advice: "Embrace accountability, simplify your life, and commit to long-term goals.",
        mbtiAdvice: {
          INTJ: "Use this time to refine your strategic vision and eliminate inefficiencies.",
          INFJ: "Focus on aligning your ideals with practical reality. Set healthy boundaries.",
          ENTP: "Channel your ideas into concrete structures. Follow through is essential now.",
          ENFP: "Ground your enthusiasm in realistic commitments. Quality over quantity.",
          ISTJ: "This energy aligns with your nature. Build systems that will serve you long-term.",
          ISFJ: "Don't take on everyone else's responsibilities. Focus on your own growth.",
          ESTJ: "Perfect time for organizational restructuring and leadership development.",
          ESFJ: "Balance helping others with taking care of your own foundational needs.",
          ISTP: "Create practical systems that support your independence and skills.",
          ISFP: "Structure your creative life. Commit to practices that nurture your art.",
          ESTP: "Slow down and plan for the future. Your adaptability needs direction now.",
          ESFP: "Build stability that supports your spontaneous nature long-term.",
          INTP: "Organize your ideas into actionable frameworks. Theory needs application.",
          INFP: "Align your values with concrete life structures. Make your ideals real.",
          ENTJ: "Refine your leadership approach. Build systems that scale with your ambitions.",
          ENFJ: "Focus on sustainable ways to help others without burning yourself out.",
        },
      })
    }

    // Jupiter cycles (every ~12 years)
    if (yearAge % 12 === 0) {
      events.push({
        id: `jupiter-${year}`,
        year,
        title: "Jupiter Return",
        description: "New cycle of growth, expansion, and opportunity begins.",
        type: "jupiter",
        intensity: "medium",
        theme: "Expansion & Opportunity",
        advice: "Say yes to growth opportunities, but maintain realistic expectations.",
      })
    }

    // Uranus opposition (~age 42)
    if (Math.abs(yearAge - 42) <= 1) {
      events.push({
        id: `uranus-${year}`,
        year,
        title: "Uranus Opposition",
        description: "Midlife awakening. Time to break free from limiting patterns.",
        type: "uranus",
        intensity: "high",
        theme: "Freedom & Authenticity",
        advice: "Embrace change and rediscover your authentic self. Liberation is possible.",
      })
    }

    // Neptune square (~age 42)
    if (Math.abs(yearAge - 42) <= 2 && yearAge !== 42) {
      events.push({
        id: `neptune-${year}`,
        year,
        title: "Neptune Square",
        description: "Spiritual awakening mixed with confusion about life direction.",
        type: "neptune",
        intensity: "medium",
        theme: "Spiritual Clarity",
        advice: "Trust your intuition but verify practical details. Seek spiritual guidance.",
      })
    }

    // Chiron return (~age 50)
    if (Math.abs(yearAge - 50) <= 1) {
      events.push({
        id: `chiron-${year}`,
        year,
        title: "Chiron Return",
        description: "Healing old wounds and transforming pain into wisdom.",
        type: "chiron",
        intensity: "medium",
        theme: "Healing & Wisdom",
        advice: "Engage in healing work. Your wounds can become your greatest strengths.",
      })
    }

    // Add some general themes based on year patterns
    if (events.length === 0) {
      // Create general themes for years without major transits
      const themes = [
        {
          title: "Integration & Growth",
          description: "A year for integrating recent changes and steady personal development.",
          theme: "Personal Development",
          advice: "Focus on consistent daily practices and gradual improvement.",
          tone: "stability" as const,
        },
        {
          title: "Creative Expression",
          description: "Favorable time for creative projects and self-expression.",
          theme: "Creativity & Innovation",
          advice: "Pursue artistic endeavors and innovative solutions to old problems.",
          tone: "growth" as const,
        },
        {
          title: "Relationship Focus",
          description: "Year emphasizing partnerships, collaboration, and social connections.",
          theme: "Relationships & Partnership",
          advice: "Invest in meaningful relationships and collaborative projects.",
          tone: "expansion" as const,
        },
      ]

      const selectedTheme = themes[year % themes.length]
      events.push({
        id: `general-${year}`,
        year,
        title: selectedTheme.title,
        description: selectedTheme.description,
        type: "major",
        intensity: "low",
        theme: selectedTheme.theme,
        advice: selectedTheme.advice,
      })
    }

    // Determine overall year tone
    let overallTone: YearlyTheme["overallTone"] = "stability"
    if (events.some((e) => e.intensity === "high")) {
      overallTone = events.some((e) => e.type === "saturn") ? "challenging" : "transformation"
    } else if (events.some((e) => e.type === "jupiter")) {
      overallTone = "expansion"
    } else if (events.some((e) => e.intensity === "medium")) {
      overallTone = "growth"
    }

    timeline.push({
      year,
      title: `${year} - ${events[0]?.theme || "Steady Progress"}`,
      description: events[0]?.description || "A year of steady development and integration.",
      keyEvents: events,
      overallTone,
    })
  }

  return timeline
}

export function getTimelineAdvice(event: TimelineEvent, mbtiType?: MBTIType): string {
  if (mbtiType && event.mbtiAdvice?.[mbtiType]) {
    return event.mbtiAdvice[mbtiType]
  }
  return event.advice
}
