import { PROVIDERS } from "./providers";

const nameOf = (id) => PROVIDERS.find((p) => p.id === id)?.name || id;

function buildMessages(history, me) {
  const out = [];
  const add = (role, content) => {
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content;
    else out.push({ role, content });
  };
  for (const m of history) {
    if (m.role === "user") add("user", m.text);
    else if (m.error) continue;
    else if (m.provider === me) add("assistant", m.text);
    else add("user", `[${nameOf(m.provider)}]: ${m.text}`);
  }
  return out;
}

export async function askAI({ provider, key, history, long, others }) {
  const system =
    `You are ${nameOf(provider)}, one of the AIs in a group chat app called Omni. ` +
    `AIs in this chat: ${others.join(", ")}. Messages from other AIs appear as "[Name]: ...". ` +
    `Reply only as yourself, never start with your name. ` +
    (long
      ? "The user wants a detailed answer, so be thorough. "
      : "Keep replies short: 2-4 sentences, no filler, unless the user asks for detail. ") +
    "Reply in the user's language (Hinglish is fine).";

  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, key, system, messages: buildMessages(history, provider) }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error(d.error || "Request fail ho gayi");
  return d.text || "(khali reply aaya)";
}
