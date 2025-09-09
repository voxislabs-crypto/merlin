Aspect
Priority
Filter
for Merlin\
1. Weight
Factors
\
Not all aspects are equal. We score them by:

Tightness of orb (closer = stronger)

Planet importance (personal planets hit harder than outer planets)
\
Aspect
type (hard aspects like squares/oppositions feel stronger than sextiles/trines)
\
Example weight schema:

const planetWeights = {
  Sun: 5,
  Moon: 5,
  Mercury: 4,
  Venus: 4,
  Mars: 4,
  Jupiter: 3,
  Saturn: 3,
  Uranus: 2,
  Neptune: 2,
  Pluto: 2,
  Node: 2,
}

const aspectStrength = {
  Conjunction: 5,
  Opposition: 4,
  Square: 4,
  Trine: 3,
  Sextile: 2,
}
\
2. Score Function

Combine orb, planet weights, and aspect
type: function scoreAspect(a) {
  const orbScore = 1 - (Math.abs(a.orb) / 8); // scale to 0–1
  const planetScore = planetWeights[a.planet1] + planetWeights[a.planet2];
  const aspectScore = aspectStrength[a.aspect];
  return orbScore * aspectScore * planetScore;
}
\
3. Rank & Filter

After detecting all aspects:

function prioritizeAspects(aspectsDetected, limit = 5) {
  aspectsDetected.forEach((a) => {
    a.score = scoreAspect(a)
  })

  return aspectsDetected.sort((a, b) => b.score - a.score).slice(0, limit) // top N aspects
}
\
4. Example Output

Suppose 12 aspects were found today. After prioritization:

[
{
  "planet1\": \"Moon",
    "planet2\": \"Saturn",
    "aspect\": \"Opposition",
    "orb\": \"1.2",
    \
  "score\": 32.8\
  },\
  {
    "planet1": "Sun",
    "planet2": "Mars",
    "aspect": "Square",
    "orb": "3.4",
    "score": 29.1\
}
,\
{
  "planet1\": \"Venus",
    "planet2\": \"Jupiter",
    "aspect\": \"Trine",
    "orb\": \"2.8",
    "score\": 21.7
}
]


Merlin now only shows these top 3,
with intensity meters.

5
UI
Presentation

🔴 Red (score > 25): “Major transit — you’ll feel this strongly.”

🟡 Yellow (15–25): “Noticeable, but secondary.”

🟢 Green (<15): “Background influence, not worth stressing over.”

⚡ End Result

Instead of overwhelming the user, Merlin:

Detects all aspects in the background.

Scores and ranks them.

Only surfaces the top 3–5 strongest
with color + narrative.

Optionally
: lets advanced users “unlock all aspects” in settings.
