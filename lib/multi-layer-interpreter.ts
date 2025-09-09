export interface InterpretationLayer {
  name: string
  weight: number
  interpret: (context: TransitContext) => LayerInterpretation
}

export interface TransitContext {
  planet1: string
  planet2: string
  aspect: string
  orb: number
  house: number
  natalChart: any
  personality: string
  currentCycles: string[]
}

export interface LayerInterpretation {
  theme: string
  intensity: number
  guidance: string
  probability: number
  timeframe: string
}

export class PlanetPairLayer implements InterpretationLayer {
  name = "Planet Pair Dynamics"
  weight = 0.3

  interpret(context: TransitContext): LayerInterpretation {
    const key = `${context.planet1}_${context.aspect}_${context.planet2}`
    const interpretation = planetPairLookup[key] || {
      theme: "Planetary interaction",
      base_intensity: 0.5,
      guidance: "General planetary influence",
      probability: 0.6,
    }

    return {
      theme: interpretation.theme,
      intensity: interpretation.base_intensity * (1 - context.orb / 10),
      guidance: interpretation.guidance,
      probability: interpretation.probability,
      timeframe: this.calculateTimeframe(context.aspect),
    }
  }

  private calculateTimeframe(aspect: string): string {
    const timeframes = {
      conjunction: "1-3 days peak",
      opposition: "3-5 days tension",
      square: "2-4 days challenge",
      trine: "2-3 days flow",
      sextile: "1-2 days opportunity",
    }
    return timeframes[aspect] || "2-3 days"
  }
}

export class HouseContextLayer implements InterpretationLayer {
  name = "House Context"
  weight = 0.25

  interpret(context: TransitContext): LayerInterpretation {
    const houseThemes = {
      1: { theme: "Identity & Self-Expression", area: "personal image" },
      2: { theme: "Resources & Values", area: "money and possessions" },
      3: { theme: "Communication & Learning", area: "daily interactions" },
      4: { theme: "Home & Family", area: "emotional foundation" },
      5: { theme: "Creativity & Romance", area: "self-expression" },
      6: { theme: "Work & Health", area: "daily routines" },
      7: { theme: "Relationships & Partnerships", area: "one-on-one connections" },
      8: { theme: "Transformation & Shared Resources", area: "deep change" },
      9: { theme: "Philosophy & Higher Learning", area: "beliefs and expansion" },
      10: { theme: "Career & Public Image", area: "professional life" },
      11: { theme: "Community & Future Goals", area: "friendships and aspirations" },
      12: { theme: "Spirituality & Subconscious", area: "hidden influences" },
    }

    const house = houseThemes[context.house] || houseThemes[1]

    return {
      theme: `${house.theme} Focus`,
      intensity: 0.7,
      guidance: `This transit activates your ${house.area}. Pay attention to developments in this life area.`,
      probability: 0.8,
      timeframe: "Duration of transit",
    }
  }
}

export class CycleLayer implements InterpretationLayer {
  name = "Major Cycles"
  weight = 0.2

  interpret(context: TransitContext): LayerInterpretation {
    const activeCycle = this.identifyMajorCycle(context)

    if (activeCycle) {
      return {
        theme: activeCycle.name,
        intensity: activeCycle.intensity,
        guidance: activeCycle.guidance,
        probability: 0.9,
        timeframe: activeCycle.duration,
      }
    }

    return {
      theme: "Regular Transit",
      intensity: 0.4,
      guidance: "Standard planetary influence",
      probability: 0.6,
      timeframe: "Transit duration",
    }
  }

  private identifyMajorCycle(context: TransitContext) {
    // Identify major life cycles
    if (context.planet1 === "Saturn" && context.currentCycles.includes("saturn_return")) {
      return {
        name: "Saturn Return",
        intensity: 0.95,
        guidance: "Major life restructuring period. Time to build lasting foundations.",
        duration: "2-3 years",
      }
    }

    if (context.planet1 === "Uranus" && context.aspect === "opposition") {
      return {
        name: "Uranus Opposition (Midlife Awakening)",
        intensity: 0.85,
        guidance: "Time for authentic self-expression and breaking free from limitations.",
        duration: "1-2 years",
      }
    }

    return null
  }
}

export class PersonalityOverlayLayer implements InterpretationLayer {
  name = "Personality Filter"
  weight = 0.25

  interpret(context: TransitContext): LayerInterpretation {
    const personalityFilters = {
      INFJ: {
        filter: "internalize and seek meaning",
        guidance: "Journal your insights and trust your intuition during this transit.",
      },
      ENTJ: {
        filter: "strategize and take action",
        guidance: "Use this energy to advance your long-term goals and lead others.",
      },
      ISFP: {
        filter: "feel deeply and express authentically",
        guidance: "Honor your emotions and express yourself through creative outlets.",
      },
      // ... more personality types
    }

    const filter = personalityFilters[context.personality] || personalityFilters["INFJ"]

    return {
      theme: `${context.personality} Processing Style`,
      intensity: 0.6,
      guidance: `As an ${context.personality}, you tend to ${filter.filter}. ${filter.guidance}`,
      probability: 0.85,
      timeframe: "Personal processing time",
    }
  }
}

export class MultiLayerInterpreter {
  private layers: InterpretationLayer[] = [
    new PlanetPairLayer(),
    new HouseContextLayer(),
    new CycleLayer(),
    new PersonalityOverlayLayer(),
  ]

  interpret(context: TransitContext) {
    const layerResults = this.layers.map((layer) => ({
      layer: layer.name,
      weight: layer.weight,
      result: layer.interpret(context),
    }))

    // Calculate weighted synthesis
    const totalIntensity = layerResults.reduce((sum, lr) => sum + lr.result.intensity * lr.weight, 0)

    const averageProbability = layerResults.reduce((sum, lr) => sum + lr.result.probability * lr.weight, 0)

    return {
      layers: layerResults,
      synthesis: {
        overallIntensity: totalIntensity,
        confidence: averageProbability,
        primaryTheme: layerResults.sort((a, b) => b.result.intensity * b.weight - a.result.intensity * a.weight)[0]
          .result.theme,
        convergentGuidance: this.synthesizeGuidance(layerResults),
      },
    }
  }

  private synthesizeGuidance(layerResults: any[]): string {
    // AI-powered narrative synthesis would go here
    // For now, combine the strongest guidance elements
    const strongestLayers = layerResults
      .filter((lr) => lr.result.intensity > 0.6)
      .sort((a, b) => b.result.intensity * b.weight - a.result.intensity * a.weight)
      .slice(0, 2)

    return strongestLayers.map((lr) => lr.result.guidance).join(" ") || "General planetary influence active."
  }
}

// Enhanced lookup table with probability scoring
const planetPairLookup = {
  Moon_opposition_Saturn: {
    theme: "Emotional Restriction",
    base_intensity: 0.8,
    guidance: "Feelings of isolation or emotional burden. Set boundaries rather than withdraw completely.",
    probability: 0.85,
  },
  Sun_conjunction_Jupiter: {
    theme: "Confidence Expansion",
    base_intensity: 0.9,
    guidance: "Optimism and growth opportunities. Take calculated risks and expand your horizons.",
    probability: 0.9,
  },
  Mars_square_Pluto: {
    theme: "Power Struggles",
    base_intensity: 0.95,
    guidance: "Intense confrontations possible. Channel this energy into transformation, not destruction.",
    probability: 0.8,
  },
  // ... extensive lookup table continues
}
