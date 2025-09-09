Theme - Priority
Algorithm
\
1. Weighted Theme Scoring
\
Each detected aspect already has a score (orb tightness × planet importance × aspect
type
).
Now, roll those scores up into themes:

function themeScores(aspectsDetected) {
  const scores = {}

  aspectsDetected.forEach((a) => {
    const themes = assignThemes(a) // from our earlier theme map
    const weight = scoreAspect(a) // from priority filter

    themes.forEach((t) => {
      scores[t] = (scores[t] || 0) + weight
    })
  })

  return scores
}

\
This gives you a total “theme strength”
for the day.\
\
2. Pick Main Focus
\
Choose the theme
with the highest
score as the
headline: function mainTheme(scores) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0][0]; // theme name with max score
}
\
3. Assign Primary & Secondary Themes

Output structure:

{
  ;("primaryTheme")
  : \"Relationships",
  "secondaryThemes": ["Career", "Inner Work"]
}
\
4. Example Run

Suppose aspects today are:

Moon square Venus (Relationships, score 28)

Sun opposition Saturn (Career, score 25)

Pluto trine Chiron (Inner Work, score 15)

Theme scores →

Relationships: 28

Career: 25

Inner Work: 15

Output →

{
  ;("primaryTheme")
  : \"Relationships",
  "secondaryThemes": ["Career", "Inner Work"]
}
\
5. Narrative Flow in Forecast

Merlin can now write forecasts like this:

Today’s Focus: Relationships (🔴)
“Moon square Venus stirs emotional tension in love and money. Prioritize honesty and patience.”

Secondary Themes:

Career (🟡): Sun opp Saturn — Authority feels heavy, deadlines loom.

Inner Work (🟢): Pluto trine Chiron — Subtle healing of old wounds.

6. UI Idea

Top of screen: Primary Focus Card (theme + headline guidance).

Below: Secondary Cards
with supporting aspects.
\
Intensity bar per card (Red/Yellow/Green).

⚡ Why This Matters

Keeps users from drowning in astro jargon.

Gives each day a single headline focus → feels personal, digestible.

Matches how real life feels (usually 1 main “thing” dominates a day).

Opens the door to theme-based push notifications:
“⚡ Today’s Focus: Relationships — tension between love and emotional needs. Be patient.”
