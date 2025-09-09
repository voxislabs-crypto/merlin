export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const

export type MBTIType = (typeof MBTI_TYPES)[number]

export interface MBTIProfile {
  type: MBTIType
  name: string
  description: string
  strengths: string[]
  challenges: string[]
  cosmicTendencies: string[]
}

export const MBTI_PROFILES: Record<MBTIType, MBTIProfile> = {
  INTJ: {
    type: "INTJ",
    name: "The Architect",
    description: "Strategic, independent, and highly intuitive about patterns and future possibilities.",
    strengths: ["Strategic thinking", "Independence", "Future-focused", "Pattern recognition"],
    challenges: ["Perfectionism", "Impatience with inefficiency", "Overthinking"],
    cosmicTendencies: [
      "Responds well to Saturn transits",
      "Struggles with Neptune fog",
      "Thrives during Mercury-focused periods",
    ],
  },
  INTP: {
    type: "INTP",
    name: "The Thinker",
    description: "Logical, flexible, and fascinated by theoretical concepts and abstract ideas.",
    strengths: ["Analytical thinking", "Adaptability", "Intellectual curiosity", "Problem-solving"],
    challenges: ["Procrastination", "Difficulty with routine", "Emotional expression"],
    cosmicTendencies: [
      "Energized by Uranus transits",
      "Challenged by Mars pressure",
      "Enjoys Mercury retrograde reflection",
    ],
  },
  ENTJ: {
    type: "ENTJ",
    name: "The Commander",
    description: "Natural leaders who are decisive, confident, and goal-oriented.",
    strengths: ["Leadership", "Strategic planning", "Confidence", "Goal achievement"],
    challenges: ["Impatience", "Overlooking emotions", "Burnout"],
    cosmicTendencies: [
      "Thrives during Mars transits",
      "Struggles with Venus slowdowns",
      "Benefits from Jupiter expansion",
    ],
  },
  ENTP: {
    type: "ENTP",
    name: "The Debater",
    description: "Enthusiastic, creative, and spontaneous with a love for new possibilities.",
    strengths: ["Innovation", "Enthusiasm", "Adaptability", "Networking"],
    challenges: ["Follow-through", "Routine tasks", "Emotional sensitivity"],
    cosmicTendencies: ["Loves Uranus surprises", "Frustrated by Saturn restrictions", "Energized by Jupiter optimism"],
  },
  INFJ: {
    type: "INFJ",
    name: "The Advocate",
    description: "Insightful, principled, and deeply concerned with personal growth and helping others.",
    strengths: ["Intuition", "Empathy", "Vision", "Personal growth focus"],
    challenges: ["Perfectionism", "Emotional overwhelm", "Boundary issues"],
    cosmicTendencies: [
      "Highly sensitive to Moon phases",
      "Absorbs Pluto intensity",
      "Needs extra care during heavy transits",
    ],
  },
  INFP: {
    type: "INFP",
    name: "The Mediator",
    description: "Idealistic, creative, and driven by personal values and authenticity.",
    strengths: ["Creativity", "Authenticity", "Empathy", "Value-driven"],
    challenges: ["Criticism sensitivity", "Decision paralysis", "Conflict avoidance"],
    cosmicTendencies: ["Inspired by Venus transits", "Overwhelmed by Mars aggression", "Needs gentle cosmic weather"],
  },
  ENFJ: {
    type: "ENFJ",
    name: "The Protagonist",
    description: "Charismatic, inspiring, and naturally focused on helping others reach their potential.",
    strengths: ["Inspiration", "Communication", "Empathy", "Leadership"],
    challenges: ["People-pleasing", "Neglecting self-care", "Emotional burnout"],
    cosmicTendencies: ["Energized by Jupiter expansion", "Drained by Saturn tests", "Sensitive to collective transits"],
  },
  ENFP: {
    type: "ENFP",
    name: "The Campaigner",
    description: "Enthusiastic, creative, and spontaneous with strong people skills.",
    strengths: ["Enthusiasm", "Creativity", "People skills", "Optimism"],
    challenges: ["Focus issues", "Routine aversion", "Emotional intensity"],
    cosmicTendencies: ["Thrives in positive transits", "Struggles with heavy Saturn", "Loves Venus social energy"],
  },
  ISTJ: {
    type: "ISTJ",
    name: "The Logistician",
    description: "Practical, responsible, and committed to traditional values and hard work.",
    strengths: ["Reliability", "Organization", "Practicality", "Persistence"],
    challenges: ["Resistance to change", "Stress under pressure", "Emotional expression"],
    cosmicTendencies: [
      "Comfortable with Saturn structure",
      "Challenged by Uranus disruption",
      "Prefers predictable cosmic weather",
    ],
  },
  ISFJ: {
    type: "ISFJ",
    name: "The Protector",
    description: "Caring, responsible, and committed to helping others and maintaining harmony.",
    strengths: ["Caring nature", "Reliability", "Attention to detail", "Loyalty"],
    challenges: ["Overcommitment", "Difficulty saying no", "Neglecting self"],
    cosmicTendencies: ["Sensitive to Moon transits", "Stressed by conflict aspects", "Benefits from Venus harmony"],
  },
  ESTJ: {
    type: "ESTJ",
    name: "The Executive",
    description: "Organized, practical, and focused on efficiency and getting things done.",
    strengths: ["Organization", "Leadership", "Efficiency", "Goal-oriented"],
    challenges: ["Inflexibility", "Impatience", "Overlooking emotions"],
    cosmicTendencies: [
      "Works well with Saturn discipline",
      "Frustrated by Neptune confusion",
      "Energized by Mars action",
    ],
  },
  ESFJ: {
    type: "ESFJ",
    name: "The Consul",
    description: "Caring, social, and focused on helping others and maintaining group harmony.",
    strengths: ["Social skills", "Helpfulness", "Organization", "Loyalty"],
    challenges: ["Criticism sensitivity", "Overcommitment", "Conflict avoidance"],
    cosmicTendencies: ["Loves Venus social transits", "Stressed by Mars conflict", "Sensitive to group dynamics"],
  },
  ISTP: {
    type: "ISTP",
    name: "The Virtuoso",
    description: "Practical, flexible, and skilled at understanding how things work.",
    strengths: ["Problem-solving", "Adaptability", "Practical skills", "Independence"],
    challenges: ["Emotional expression", "Long-term planning", "Routine tasks"],
    cosmicTendencies: [
      "Adapts well to changing transits",
      "Enjoys Mars energy bursts",
      "Dislikes prolonged heavy aspects",
    ],
  },
  ISFP: {
    type: "ISFP",
    name: "The Adventurer",
    description: "Gentle, caring, and driven by personal values and aesthetic appreciation.",
    strengths: ["Creativity", "Flexibility", "Empathy", "Aesthetic sense"],
    challenges: ["Criticism sensitivity", "Decision making", "Self-promotion"],
    cosmicTendencies: ["Inspired by Venus beauty", "Overwhelmed by harsh aspects", "Needs gentle cosmic support"],
  },
  ESTP: {
    type: "ESTP",
    name: "The Entrepreneur",
    description: "Energetic, practical, and focused on immediate action and results.",
    strengths: ["Action-oriented", "Adaptability", "Social skills", "Problem-solving"],
    challenges: ["Long-term planning", "Patience", "Emotional depth"],
    cosmicTendencies: ["Energized by Mars action", "Bored by slow transits", "Thrives in dynamic cosmic weather"],
  },
  ESFP: {
    type: "ESFP",
    name: "The Entertainer",
    description: "Enthusiastic, spontaneous, and focused on enjoying life and helping others.",
    strengths: ["Enthusiasm", "People skills", "Spontaneity", "Optimism"],
    challenges: ["Planning ahead", "Criticism handling", "Focus issues"],
    cosmicTendencies: [
      "Loves positive Venus transits",
      "Struggles with Saturn restrictions",
      "Sensitive to emotional aspects",
    ],
  },
}

export function getDetailedMBTITranslation(mbtiType: MBTIType, effects: string[], transitAspects: string[]): string {
  const profile = MBTI_PROFILES[mbtiType]
  const hasHeavy = effects.some((e) => ["heavy", "intense", "volatile", "chaotic"].includes(e))
  const hasPositive = effects.some((e) => ["positive", "productive", "energized", "expansive"].includes(e))
  const hasSaturn = transitAspects.some((aspect) => aspect.includes("Saturn"))
  const hasMars = transitAspects.some((aspect) => aspect.includes("Mars"))
  const hasVenus = transitAspects.some((aspect) => aspect.includes("Venus"))
  const hasUranus = transitAspects.some((aspect) => aspect.includes("Uranus"))
  const hasNeptune = transitAspects.some((aspect) => aspect.includes("Neptune"))
  const hasPluto = transitAspects.some((aspect) => aspect.includes("Pluto"))

  // Type-specific responses to different planetary energies
  const responses: Record<MBTIType, any> = {
    INTJ: {
      saturn: hasHeavy
        ? "Your strategic mind can work with Saturn's restrictions. Use this time to refine your long-term plans."
        : "Saturn's structure supports your natural planning abilities. Build something lasting.",
      mars: hasHeavy
        ? "Mars energy may feel disruptive to your methodical approach. Channel it into focused action on priority projects."
        : "Mars gives you the drive to implement your visions. Strike while the iron is hot.",
      venus:
        "Venus softens your intensity. Good time for relationships and creative projects, though don't let charm override logic.",
      uranus: hasHeavy
        ? "Uranus disruption challenges your need for control. Stay flexible - unexpected changes may improve your plans."
        : "Uranus brings innovative insights. Your pattern recognition will spot new opportunities.",
      neptune:
        "Neptune fog frustrates your clarity-seeking nature. Double-check facts and trust your intuition over appearances.",
      pluto:
        "Pluto's intensity matches your depth. Use this transformative energy to rebuild systems that no longer serve you.",
    },
    INFJ: {
      saturn: hasHeavy
        ? "Saturn's weight feels extra heavy for your sensitive nature. Set boundaries and don't absorb others' responsibilities."
        : "Saturn helps structure your idealistic visions. Your patience will be rewarded.",
      mars: hasHeavy
        ? "Mars aggression overwhelms your harmony-seeking nature. Retreat when needed and express anger constructively."
        : "Mars gives you courage to advocate for your values. Speak up for what matters.",
      venus:
        "Venus aligns with your desire for meaningful connections. Perfect time for deep conversations and creative expression.",
      uranus: hasHeavy
        ? "Uranus shocks disrupt your need for stability. Trust that changes align with your higher purpose."
        : "Uranus awakens new insights about your path. Your intuition is especially sharp now.",
      neptune:
        "Neptune enhances your natural psychic abilities but may blur practical boundaries. Stay grounded in daily routines.",
      pluto:
        "Pluto's transformation resonates with your growth-oriented nature. Old wounds surface to be healed - embrace the process.",
    },
    ENTP: {
      saturn: hasHeavy
        ? "Saturn's restrictions frustrate your free-spirited nature. Find creative ways to work within limitations."
        : "Saturn forces you to follow through on ideas. Your innovation needs structure to manifest.",
      mars: "Mars fuels your natural enthusiasm. Great time for debates, networking, and launching new projects.",
      venus:
        "Venus adds charm to your natural charisma. Social connections flourish, but don't neglect deeper commitments.",
      uranus: "Uranus is your cosmic ally! Expect sudden insights, exciting opportunities, and breakthrough moments.",
      neptune: hasHeavy
        ? "Neptune's confusion clashes with your need for mental clarity. Avoid major decisions until the fog lifts."
        : "Neptune inspires your creative side. Let imagination guide new possibilities.",
      pluto: hasHeavy
        ? "Pluto's intensity may feel overwhelming. Channel transformative energy into reinventing outdated aspects of your life."
        : "Pluto empowers your natural ability to see through facades. Use insights wisely.",
    },
    ENFP: {
      saturn: hasHeavy
        ? "Saturn's heaviness dampens your natural optimism. Focus on one project at a time instead of scattering energy."
        : "Saturn helps you build on your inspirations. Your enthusiasm needs practical structure.",
      mars: hasHeavy
        ? "Mars conflict drains your people-focused energy. Avoid arguments and channel passion into creative outlets."
        : "Mars energizes your natural enthusiasm. Perfect time for inspiring others and taking bold action.",
      venus:
        "Venus amplifies your love for people and beauty. Social events, creative projects, and romance all flourish now.",
      uranus:
        "Uranus brings the excitement you crave! New people, ideas, and opportunities align with your adventurous spirit.",
      neptune: hasHeavy
        ? "Neptune's confusion frustrates your need for authentic connection. Trust your heart over your head."
        : "Neptune enhances your empathy and creativity. Artistic pursuits and spiritual growth are favored.",
      pluto: hasHeavy
        ? "Pluto's intensity feels overwhelming to your optimistic nature. Focus on personal transformation rather than fixing others."
        : "Pluto deepens your understanding of human nature. Use insights to help others grow.",
    },
  }

  // Generate personalized advice based on dominant planetary influence
  let advice = `As ${profile.name}, `

  if (hasSaturn && responses[mbtiType].saturn) {
    advice += responses[mbtiType].saturn
  } else if (hasMars && responses[mbtiType].mars) {
    advice += responses[mbtiType].mars
  } else if (hasVenus && responses[mbtiType].venus) {
    advice += responses[mbtiType].venus
  } else if (hasUranus && responses[mbtiType].uranus) {
    advice += responses[mbtiType].uranus
  } else if (hasNeptune && responses[mbtiType].neptune) {
    advice += responses[mbtiType].neptune
  } else if (hasPluto && responses[mbtiType].pluto) {
    advice += responses[mbtiType].pluto
  } else {
    // Fallback based on general energy
    if (hasHeavy) {
      advice += `today's challenging energies may feel intense for your ${profile.strengths[0].toLowerCase()} nature. Focus on your strength in ${profile.strengths[1].toLowerCase()} to navigate difficulties.`
    } else if (hasPositive) {
      advice += `today's positive energies align well with your natural ${profile.strengths[0].toLowerCase()}. This is a great time to leverage your ${profile.strengths[1].toLowerCase()}.`
    } else {
      advice += `today's mixed energies call for balance. Use your ${profile.strengths[0].toLowerCase()} while being mindful of your tendency toward ${profile.challenges[0].toLowerCase()}.`
    }
  }

  return advice
}
