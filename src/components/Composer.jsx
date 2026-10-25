import { useState } from "react";
import { PROVIDERS } from "../providers";

export default function Composer({ onSend, busy }) {
  const [text, setText] = useState("");
  const m = text.match(/@([a-z0-9_]*)$/i);
  const sugg = m
    ? PROVIDERS.filter((p) => p.aliases[0].startsWith(m[1].toLowerCase()))
    : [];

  function pick(p) {
    setText(text.replace(/@([a-z0-9_]*)$/i, "@" + p.aliases[0] + " "));
  }

  function send() {
    const t = text.trim();
    if (!t || busy) return;
    onSend(t);
    setText("");
  }

  return (
    <div className="composer">
      {sugg.length > 0 && (
        <div className="sugg">
          {sugg.map((p) => (
            <button key={p.id} onClick={() => pick(p)}>@{p.aliases[0]}</button>
          ))}
        </div>
      )}
      <div className="row">
        <textarea
          rows={1}
          value={text}
          placeholder="Message likho... @ se AI chuno"
          onChange={(e) => setText(e.target.value)}
        />
        <button className="primary" onClick={send} disabled={busy}>
          {busy ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
