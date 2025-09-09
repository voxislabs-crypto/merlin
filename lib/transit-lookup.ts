export interface TransitInterpretation {
  effect:
    | "positive"
    | "neutral"
    | "heavy"
    | "intense"
    | "volatile"
    | "chaotic"
    | "excessive"
    | "productive"
    | "frustrated"
    | "energized"
    | "expansive"
    | "serious"
    | "restrictive"
    | "midlife-shift"
    | "foggy"
    | "confusing"
    | "transformative"
    | "wounding-healing"
    | "vulnerable"
    | "emotional-healing"
    | "tense"
    | "chaotic-expansive"
  interpretation: string
  do: string[]
  dont: string[]
}

export const TRANSIT_LOOKUP: Record<string, TransitInterpretation> = {
  "Moon conjunct Sun": {
    effect: "neutral",
    interpretation: "New Moon energy. A day for fresh starts and intention setting.",
    do: ["Set intentions for the month ahead", "Start new projects", "Keep energy light and flexible"],
    dont: ["Overcommit before clarity arrives", "Expect immediate results", "Cling to old cycles"],
  },
  "Moon opposition Sun": {
    effect: "intense",
    interpretation: "Full Moon energy. Emotions peak, revelations surface.",
    do: ["Release what no longer serves you", "Acknowledge heightened emotions", "Engage in reflection or ritual"],
    dont: ["Make rash decisions", "Ignore emotional needs", "Pick unnecessary fights"],
  },
  "Moon square Sun": {
    effect: "tense",
    interpretation: "Quarter Moon. Conflict between will and emotions.",
    do: ["Balance logic and feelings", "Compromise in disagreements", "Take small, practical steps"],
    dont: ["Force issues", "Ignore inner tension", "Let minor stress explode"],
  },
  "Moon conjunct Saturn": {
    effect: "heavy",
    interpretation: "Emotional restraint, responsibility, seriousness.",
    do: ["Handle duties responsibly", "Rest and conserve energy", "Lean on structure for support"],
    dont: ["Suppress emotions completely", "Take on extra burdens", "Expect external validation"],
  },
  "Moon opposition Saturn": {
    effect: "heavy",
    interpretation: "Feeling unsupported or burdened. Emotional tests.",
    do: ["Stick to routines", "Handle obligations first", "Give yourself extra rest"],
    dont: ["Resist responsibilities", "Seek approval from authority", "Spiral into negativity"],
  },
  "Moon conjunct Pluto": {
    effect: "intense",
    interpretation: "Emotional depths and hidden truths surface.",
    do: ["Face your feelings honestly", "Engage in shadow work", "Release toxic attachments"],
    dont: ["Manipulate or guilt others", "Cling to control", "Suppress emotions harshly"],
  },
  "Moon opposition Pluto": {
    effect: "intense",
    interpretation: "Power struggles, emotional extremes, revelations.",
    do: ["Practice self-control", "Detach from manipulative dynamics", "Channel intensity into healing"],
    dont: ["Obsess over control", "Escalate drama", "Get stuck in paranoia"],
  },
  "Moon conjunct Jupiter": {
    effect: "positive",
    interpretation: "Emotional optimism, generosity, expansion.",
    do: ["Say yes to opportunities", "Spend time with uplifting people", "Share gratitude freely"],
    dont: ["Overindulge", "Promise more than you can deliver", "Ignore practical limits"],
  },
  "Moon opposition Jupiter": {
    effect: "excessive",
    interpretation: "Exaggerated emotions, overdoing it socially or financially.",
    do: ["Keep optimism grounded", "Balance generosity with self-care", "Check details before committing"],
    dont: ["Overpromise", "Spend impulsively", "Ignore boundaries"],
  },
  "Moon square Mars": {
    effect: "volatile",
    interpretation: "Tension between feelings and actions. Irritability high.",
    do: ["Use energy for exercise or projects", "Pause before reacting", "Speak honestly but calmly"],
    dont: ["Explode over small things", "Rush tasks impulsively", "Start unnecessary conflicts"],
  },
  "Sun conjunct Venus": {
    effect: "positive",
    interpretation: "Charm, beauty, and creativity are highlighted.",
    do: ["Connect socially or romantically", "Enjoy art, beauty, or self-care", "Repair strained bonds"],
    dont: ["Spend excessively", "Ignore real issues under charm", "Overindulge in flattery"],
  },
  "Sun conjunct Mercury": {
    effect: "neutral",
    interpretation: "Mental clarity and sharper communication.",
    do: ["Write or brainstorm ideas", "Make decisions", "Organize tasks"],
    dont: ["Overthink small details", "Talk over others", "Rush contracts"],
  },
  "Sun square Saturn": {
    effect: "heavy",
    interpretation: "Blocked expression, authority challenges.",
    do: ["Stay disciplined", "Work steadily", "Accept constructive criticism"],
    dont: ["Resist accountability", "Spiral into self-doubt", "Fight authority unproductively"],
  },
  "Sun sextile Saturn": {
    effect: "productive",
    interpretation: "Good for planning, structure, discipline.",
    do: ["Build long-term systems", "Take care of business", "Make realistic commitments"],
    dont: ["Ignore important details", "Procrastinate", "Overextend yourself"],
  },
  "Sun trine Jupiter": {
    effect: "positive",
    interpretation: "Luck, optimism, good timing, expansion.",
    do: ["Say yes to opportunities", "Network with optimism", "Think big but realistic"],
    dont: ["Overpromise", "Assume luck solves effort", "Neglect follow-through"],
  },
  "Sun square Uranus": {
    effect: "chaotic",
    interpretation: "Sudden disruptions or identity shifts.",
    do: ["Stay flexible", "Experiment with new ideas", "View disruption as liberation"],
    dont: ["Dig into rigid routines", "Fear instability", "React rashly"],
  },
  "Mars conjunct Sun": {
    effect: "energized",
    interpretation: "Strong drive and willpower aligned.",
    do: ["Start important projects", "Act decisively", "Channel energy into physical outlets"],
    dont: ["Rush without thinking", "Dominate conversations", "Ignore rest"],
  },
  "Mars square Moon": {
    effect: "volatile",
    interpretation: "Irritable emotions, clashes with others.",
    do: ["Burn energy in exercise", "Pause before speaking", "Be mindful of tone"],
    dont: ["Overreact emotionally", "Push people's buttons", "Make rash decisions"],
  },
  "Mars opposition Saturn": {
    effect: "frustrated",
    interpretation: "Drive blocked by responsibilities. Energy feels restricted.",
    do: ["Work methodically", "Exercise patience", "Focus on one step at a time"],
    dont: ["Force progress aggressively", "Ignore responsibilities", "Blame others for delays"],
  },
  "Mars square Pluto": {
    effect: "intense",
    interpretation: "Power struggles, explosive drive.",
    do: ["Channel energy into transformation", "Focus on discipline", "Release resentment constructively"],
    dont: ["Seek revenge", "Manipulate situations", "Explode without strategy"],
  },
  "Mars trine Jupiter": {
    effect: "positive",
    interpretation: "Confidence + opportunity. Action brings success.",
    do: ["Take bold initiative", "Pursue growth projects", "Collaborate energetically"],
    dont: ["Overextend energy", "Rush without planning", "Ignore details"],
  },
  "Jupiter conjunct Jupiter": {
    effect: "expansive",
    interpretation: "Jupiter return. A fresh 12-year luck cycle begins.",
    do: ["Say yes to new paths", "Invest in education or travel", "Think long-term"],
    dont: ["Overcommit", "Spend recklessly", "Assume luck alone will sustain you"],
  },
  "Jupiter trine Sun": {
    effect: "positive",
    interpretation: "Optimism and good timing support growth.",
    do: ["Network and expand", "Launch projects", "Seize opportunities"],
    dont: ["Neglect discipline", "Overinflate your role", "Ignore limits"],
  },
  "Jupiter square Sun": {
    effect: "excessive",
    interpretation: "Overconfidence, expansion without limits.",
    do: ["Check your facts", "Plan realistically", "Stay humble"],
    dont: ["Promise the impossible", "Spend impulsively", "Ignore practical needs"],
  },
  "Saturn conjunct Saturn": {
    effect: "serious",
    interpretation: "Saturn return. Responsibility and maturity test.",
    do: ["Take accountability", "Plan long-term", "Simplify life"],
    dont: ["Resist change", "Cling to immaturity", "Blame others"],
  },
  "Saturn square Sun": {
    effect: "restrictive",
    interpretation: "Blocked self-expression. Career/life feels heavy.",
    do: ["Work diligently", "Accept limitations gracefully", "Stay disciplined"],
    dont: ["Quit too early", "Indulge in self-pity", "Resist structure"],
  },
  "Saturn trine Sun": {
    effect: "productive",
    interpretation: "Effort meets reward. Discipline flows smoothly.",
    do: ["Plan strategically", "Build reliable systems", "Work steadily"],
    dont: ["Cut corners", "Procrastinate", "Expect instant results"],
  },
  "Uranus square Sun": {
    effect: "chaotic",
    interpretation: "Sudden changes shake your sense of identity.",
    do: ["Stay flexible", "See change as opportunity", "Experiment freely"],
    dont: ["Resist disruption", "Act out of fear", "Cling to comfort zones"],
  },
  "Neptune square Sun": {
    effect: "confusing",
    interpretation: "Identity fog. Confidence and clarity tested.",
    do: ["Rest, meditate", "Check facts carefully", "Trust instincts cautiously"],
    dont: ["Assume clarity", "Over-idealize people", "Avoid practical matters"],
  },
  "Pluto square Sun": {
    effect: "transformative",
    interpretation: "Identity under pressure. Power struggles likely.",
    do: ["Embrace inner strength", "Stand in integrity", "Transform consciously"],
    dont: ["Force outcomes", "Exploit or manipulate", "Fear endings"],
  },
  "Chiron conjunct Chiron": {
    effect: "wounding-healing",
    interpretation: "Chiron return. Old wounds resurface for healing.",
    do: ["Engage in therapy or healing work", "Reflect on your journey", "Turn wounds into wisdom"],
    dont: ["Reopen old fights", "Use pain to self-sabotage", "Isolate unnecessarily"],
  },
  "Chiron square Sun": {
    effect: "vulnerable",
    interpretation: "Identity insecurities rise. Healing opportunity.",
    do: ["Practice self-compassion", "Acknowledge vulnerabilities", "Share honestly with trusted allies"],
    dont: ["Hide pain behind pride", "Overcompensate aggressively", "Judge yourself harshly"],
  },
}

export function getDayRating(effects: string[]): "green" | "yellow" | "red" {
  const heavyEffects = ["heavy", "intense", "volatile", "chaotic", "frustrated", "transformative"]
  const positiveEffects = ["positive", "productive", "energized", "expansive"]

  const hasHeavy = effects.some((effect) => heavyEffects.includes(effect))
  const hasPositive = effects.some((effect) => positiveEffects.includes(effect))

  if (hasHeavy && !hasPositive) return "red"
  if (hasHeavy && hasPositive) return "yellow"
  if (hasPositive) return "green"
  return "yellow"
}
