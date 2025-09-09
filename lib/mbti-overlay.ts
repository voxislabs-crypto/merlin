import type { DetectedAspect } from "./aspect-detection"

export type MBTIType =
  | "INTJ"
  | "INTP"
  | "ENTJ"
  | "ENTP"
  | "INFJ"
  | "INFP"
  | "ENFJ"
  | "ENFP"
  | "ISTJ"
  | "ISFJ"
  | "ESTJ"
  | "ESFJ"
  | "ISTP"
  | "ISFP"
  | "ESTP"
  | "ESFP"

export interface MBTIOverlay {
  theme: string
  guidance: string
  mbtiType: MBTIType
}

export interface ThemeFilters {
  [theme: string]: string
}

export interface MBTIFilters {
  [mbtiType: string]: ThemeFilters
}

export const mbtiFilters: MBTIFilters = {
  INFJ: {
    Relationships:
      "You internalize tension, so be careful not to withdraw completely. Journaling or heartfelt conversations help.",
    Career:
      "You take responsibilities seriously, but may overburden yourself. Delegate instead of carrying it all alone.",
    Transformation: "You'll naturally reflect deeply. Avoid self-criticism — focus on compassionate self-awareness.",
    Spirituality: "Trust your intuitive insights, but ground them in practical action.",
    "Health & Energy": "Stress affects you deeply. Prioritize rest and emotional boundaries.",
    Communication: "Your words carry weight. Speak your truth with kindness.",
    Finance: "You may avoid money matters. Face financial decisions with your natural planning skills.",
  },
  ESTP: {
    Relationships: "You may react impulsively when stressed. Pause before speaking to avoid unnecessary conflict.",
    Career: "You thrive on action but may cut corners. Double-check details before rushing ahead.",
    Transformation: "You prefer external stimulation. Slow down long enough to notice inner signals.",
    Spirituality: "Ground spiritual concepts in real-world application to make them meaningful.",
    "Health & Energy": "Channel your high energy constructively. Physical activity helps process stress.",
    Communication: "Your directness is valuable, but consider your audience's sensitivity.",
    Finance: "Your spontaneity with money needs structure. Set up automatic systems.",
  },
  INTJ: {
    Relationships:
      "You may withdraw to strategize. Remember that connection requires vulnerability, not just solutions.",
    Career: "Your long-term vision is an asset. Break big goals into actionable steps.",
    Transformation: "You excel at systematic change. Trust the process even when progress feels slow.",
    Spirituality: "Seek spiritual frameworks that align with your logical nature.",
    "Health & Energy": "Don't neglect physical needs while pursuing mental goals.",
    Communication: "Your insights are valuable. Practice expressing them with warmth.",
    Finance: "Your strategic thinking serves you well. Don't over-analyze every decision.",
  },
  ENFP: {
    Relationships: "Your enthusiasm is contagious, but ensure you're also listening deeply.",
    Career: "Multiple interests energize you. Focus on one project at a time for best results.",
    Transformation: "You embrace change naturally. Help others see the positive possibilities.",
    Spirituality: "Your openness to new ideas is a gift. Discern what truly resonates.",
    "Health & Energy": "Your energy fluctuates with your emotions. Honor both highs and lows.",
    Communication: "Your passion inspires others. Balance excitement with practical details.",
    Finance: "Money decisions based on values work better than purely logical ones.",
  },
  ISTJ: {
    Relationships: "You show care through actions. Don't forget to express feelings verbally too.",
    Career: "Your reliability is your strength. Don't let perfectionism slow you down.",
    Transformation: "Change feels uncomfortable but you adapt well with time and structure.",
    Spirituality: "Traditional practices may resonate more than experimental approaches.",
    "Health & Energy": "Consistent routines support your wellbeing. Don't skip self-care basics.",
    Communication: "Your thoughtful words carry weight. Others value your measured perspective.",
    Finance: "Your conservative approach protects you. Occasionally consider calculated risks.",
  },
}

export function applyMBTIOverlay(theme: string, mbtiType: MBTIType): string {
  const filters = mbtiFilters[mbtiType] || {}
  return filters[theme] || ""
}

export function getMBTIGuidanceForAspects(
  aspects: DetectedAspect[],
  mbtiType: MBTIType,
  primaryTheme: string,
): MBTIOverlay[] {
  const overlays: MBTIOverlay[] = []

  // Get guidance for primary theme
  const primaryGuidance = applyMBTIOverlay(primaryTheme, mbtiType)
  if (primaryGuidance) {
    overlays.push({
      theme: primaryTheme,
      guidance: primaryGuidance,
      mbtiType,
    })
  }

  // Get guidance for other themes represented in aspects
  const themes = new Set<string>()
  aspects.forEach((aspect) => {
    // Extract themes from aspect (simplified - would use theme assignment logic)
    if (aspect.planet1 === "Venus" || aspect.planet2 === "Venus") themes.add("Relationships")
    if (aspect.planet1 === "Saturn" || aspect.planet2 === "Saturn") themes.add("Career")
    if (aspect.planet1 === "Pluto" || aspect.planet2 === "Pluto") themes.add("Transformation")
  })

  themes.forEach((theme) => {
    if (theme !== primaryTheme) {
      const guidance = applyMBTIOverlay(theme, mbtiType)
      if (guidance) {
        overlays.push({
          theme,
          guidance,
          mbtiType,
        })
      }
    }
  })

  return overlays
}

export function formatMBTIGuidance(overlay: MBTIOverlay): string {
  return `${overlay.mbtiType} Insight: ${overlay.guidance}`
}

export function getMBTITypeDescription(mbtiType: MBTIType): string {
  const descriptions: Record<MBTIType, string> = {
    INTJ: "The Architect - Strategic and independent",
    INTP: "The Thinker - Logical and innovative",
    ENTJ: "The Commander - Natural leader and organizer",
    ENTP: "The Debater - Quick-witted and clever",
    INFJ: "The Advocate - Creative and insightful",
    INFP: "The Mediator - Idealistic and loyal",
    ENFJ: "The Protagonist - Charismatic and inspiring",
    ENFP: "The Campaigner - Enthusiastic and creative",
    ISTJ: "The Logistician - Practical and fact-minded",
    ISFJ: "The Protector - Warm-hearted and dedicated",
    ESTJ: "The Executive - Organized and driven",
    ESFJ: "The Consul - Caring and social",
    ISTP: "The Virtuoso - Bold and practical",
    ISFP: "The Adventurer - Charming and sensitive",
    ESTP: "The Entrepreneur - Smart and energetic",
    ESFP: "The Entertainer - Spontaneous and enthusiastic",
  }

  return descriptions[mbtiType] || mbtiType
}

export function getPersonalityBadgeText(mbtiType: MBTIType): string {
  return `Personalized for ${mbtiType}`
}
