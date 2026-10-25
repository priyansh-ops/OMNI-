import { PROVIDERS } from "./providers";

export function findMentions(text) {
  const found = [];
  for (const m of text.matchAll(/@([a-z0-9_]+)/gi)) {
    const w = m[1].toLowerCase();
    const p = PROVIDERS.find((p) => p.aliases.includes(w));
    if (p && !found.includes(p.id)) found.push(p.id);
  }
  return found;
}

export function wantsLong(text) {
  return /(detail|lamba|lambi|bada reply|vistar|poora samjha|explain fully|in depth)/i.test(text);
}
