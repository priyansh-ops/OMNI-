import { useState } from "react";
import { PROVIDERS } from "../providers";

export default function Keys({ keys, onSave, onClose }) {
  const [draft, setDraft] = useState(keys);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave(draft);
    } catch (e) {
      alert("Save nahi hua: " + e.message);
    }
    setSaving(false);
  }

  return (
    <div className="panel">
      <h2>API Keys</h2>
      <p className="muted">Ek baar daalo, account me save rahengi. Jo nahi chahiye khali chhod do.</p>
      {PROVIDERS.map((p) => (
        <label key={p.id} className="field">
          <span>{p.name} <small className="muted">({p.keyHelp})</small></span>
          <input
            type="password"
            placeholder="Key paste karo"
            value={draft[p.id] || ""}
            onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value.trim() })}
          />
        </label>
      ))}
      <div className="row">
        <button className="primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        {onClose && <button onClick={onClose}>Cancel</button>}
      </div>
    </div>
  );
}
