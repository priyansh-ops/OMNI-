const MODELS = {
  gemini: "gemini-3.8-flash",
  chatgpt: "gpt-4o-mini",
  claude: "claude-sonnet-5-5",
  grok: "grok-3-mini",
  meta: "llama-3.3-70b-versatile",
  deepseek: "deepseek-chat",
};

const OPENAI_STYLE = {
  chatgpt: "https://api.openai.com/v1/chat/completions",
  grok: "https://api.x.ai/v1/chat/completions",
  meta: "https://api.groq.com/openai/v1/chat/completions",
  deepseek: "https://api.deepseek.com/chat/completions",
};

function errText(d, fallback) {
  if (!d) return fallback;
  if (typeof d.error === "string") return d.error;
  if (d.error?.message) return d.error.message;
  if (d.message) return d.message;
  return fallback + " " + JSON.stringify(d).slice(0, 200);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function callWithRetry(url, options, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    const r = await fetch(url, options);
    const d = await r.json().catch(() => null);
    if (r.ok) return { r, d };
    last = { r, d };
    if (![429, 500, 502, 503, 504].includes(r.status)) break;
    await wait(1500 * (i + 1));
  }
  return last;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { provider, key, system, messages } = req.body || {};
  if (!provider || !key || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Data adhura hai" });
  }

  try {
    let text = "";

    if (provider === "gemini") {
      const { r, d } = await callWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          }),
        }
      );
      if (!r.ok) throw new Error(errText(d, "Gemini error"));
      text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text).join("");
    } else if (provider === "claude") {
      const { r, d } = await callWithRetry("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODELS.claude,
          max_tokens: 2048,
          system,
          messages,
        }),
      });
      if (!r.ok) throw new Error(errText(d, "Claude error"));
      text = (d.content || []).map((b) => b.text || "").join("");
    } else if (OPENAI_STYLE[provider]) {
      const { r, d } = await callWithRetry(OPENAI_STYLE[provider], {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: MODELS[provider],
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });
      if (!r.ok) throw new Error(errText(d, "API error"));
      text = d.choices?.[0]?.message?.content || "";
    } else {
      throw new Error("Ye AI abhi supported nahi hai");
    }

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
