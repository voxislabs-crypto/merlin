// scripts/runFusionLocal.ts
// Minimal, all-in-one local test that talks to Ollama (no other imports from your app).

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

// Fallback system prompt (used if prompts/fusionPrompt.txt not found)
const DEFAULT_SYSTEM = `
You are Merlin’s Fusion Interpreter. You receive pre-scored astrological “tokens” (already filtered).
Write ONE cohesive reading with clear, practical tone. Emit only sections that have content:
1) Overview (2–4 sentences)
2) Planner Highlights (bulleted)
3) Thematics (bulleted by theme_tag)
4) Soul Insight (if present)
5) Wellness Nudge (if present)
`;

// Fallback input (used if samples/fusion_input_example.json not found)
const DEFAULT_INPUT = {
  profile: { name: "Kai", tz: "America/New_York" },
  date_context: { start: "2025-09-09", end: "2025-09-15" },
  tokens: [
    {
      layer: "Time",
      module: "Western",
      theme_tag: "growth",
      text: "Jupiter trine natal Sun supports expansion and confidence",
      window: { start: "2025-09-10", end: "2025-09-13", quality: "favorable" },
      weight: 0.82
    },
    {
      layer: "Time",
      module: "Electional",
      theme_tag: "growth",
      text: "Best launch windows Tue–Thu; avoid void-of-course Wed 14:10–16:05",
      window: { start: "2025-09-09", end: "2025-09-12", quality: "favorable" },
      weight: 0.9
    },
    {
      layer: "Theme",
      module: "Chinese",
      theme_tag: "discipline",
      text: "Metal influence favors structure and consistency",
      window: { start: "2025-01-29", end: "2026-02-16", quality: "neutral" },
      weight: 0.62
    },
    {
      layer: "Spirit",
      module: "Esoteric",
      theme_tag: "purpose",
      text: "Soul emphasis on creative service; act with heart-centered clarity",
      window: null,
      weight: 0.66
    }
  ],
  min_threshold: 0.6,
  show_sources: false
};

import fs from "fs";
import path from "path";

function tryRead(file: string): string | null {
  try { return fs.readFileSync(file, "utf8"); } catch { return null; }
}

async function callOllama(
  model: string,
  messages: ChatMsg[],
  baseUrl = "http://localhost:11434",
  temperature = 0.7
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, options: { temperature }, stream: false })
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text().catch(()=> "")}`);
  const data = await res.json();
  return data?.message?.content ?? "";
}

async function main() {
  // Optional config files (use defaults if missing)
  const llmCfgPath = path.resolve("config/llm.config.json");
  const fusionCfgPath = path.resolve("config/fusion.config.json");
  const promptPath   = (() => {
    const cfgRaw = tryRead(fusionCfgPath);
    if (!cfgRaw) return null;
    try { return JSON.parse(cfgRaw).promptPath as string; } catch { return null; }
  })();

  const systemPrompt =
    (promptPath && tryRead(path.resolve(promptPath))) ??
    (tryRead(path.resolve("prompts/fusionPrompt.txt"))) ??
    DEFAULT_SYSTEM;

  const inputRaw = tryRead(path.resolve("samples/fusion_input_example.json"));
  const input = inputRaw ? JSON.parse(inputRaw) : DEFAULT_INPUT;

  // LLM config or defaults
  let model = "mistral";
  let baseUrl = "http://localhost:11434";
  let temperature = 0.7;
  const llmCfgRaw = tryRead(llmCfgPath);
  if (llmCfgRaw) {
    try {
      const cfg = JSON.parse(llmCfgRaw);
      model = cfg.model ?? model;
      baseUrl = cfg.baseUrl ?? baseUrl;
      temperature = cfg.temperature ?? temperature;
    } catch {}
  }

  const messages: ChatMsg[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(input) }
  ];

  console.log("\n=== MERLIN FUSION (local) ===\n");
  console.log(`Model: ${model} @ ${baseUrl}\n`);
  const text = await callOllama(model, messages, baseUrl, temperature);
  console.log(text.trim());
  console.log("\n============================\n");
}

main().catch(e => { console.error(e); process.exit(1); });
