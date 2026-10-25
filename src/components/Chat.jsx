import { useEffect, useRef, useState } from "react";
import { PROVIDERS } from "../providers";
import { findMentions, wantsLong } from "../mentions";
import { askAI } from "../api";
import Composer from "./Composer";

const info = (id) => PROVIDERS.find((p) => p.id === id) || { name: id, color: "#999" };

export default function Chat({ chat, keys, onSave }) {
  const [messages, setMessages] = useState(chat.messages || []);
  const [pending, setPending] = useState([]);
  const [target, setTarget] = useState("all");
  const ref = useRef(messages);
  const endRef = useRef(null);
  const active = PROVIDERS.filter((p) => keys[p.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  function push(m) {
    ref.current = [...ref.current, m];
    setMessages(ref.current);
  }

  async function send(text) {
    const asked = findMentions(text);
    const mentioned = asked.filter((id) => keys[id]);
    if (asked.length && !mentioned.length) {
      alert("Jisko mention kiya uski key nahi hai. Keys me daalo.");
      return;
    }
    const targets = mentioned.length
      ? mentioned
      : target === "all"
      ? active.map((p) => p.id)
      : [target];
    if (!targets.length) {
      alert("Pehle Keys me koi API key daalo.");
      return;
    }

    push({ role: "user", text });
    const history = ref.current;
    const long = wantsLong(text);
    const others = active.map((p) => p.name);
    setPending(targets);

    await Promise.all(
      targets.map(async (id) => {
        try {
          const reply = await askAI({ provider: id, key: keys[id], history, long, others });
          push({ role: "ai", provider: id, text: reply, error: false });
        } catch (e) {
          push({ role: "ai", provider: id, text: e.message, error: true });
        }
        setPending((p) => p.filter((x) => x !== id));
      })
    );

    onSave({ ...chat, title: chat.title || text.slice(0, 40), messages: ref.current });
  }

  return (
    <div className="chat">
      {active.length > 1 && (
        <div className="chips">
          <button className={"chip" + (target === "all" ? " on" : "")} onClick={() => setTarget("all")}>
            Sab
          </button>
          {active.map((p) => (
            <button
              key={p.id}
              className={"chip" + (target === p.id ? " on" : "")}
              onClick={() => setTarget(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="msgs">
        {messages.length === 0 && (
          <p className="muted">
            Kuch bhi poocho. @gemini jaise mention karoge to sirf wahi jawab dega, warna sab dengे.
          </p>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="bubble user">{m.text}</div>
          ) : (
            <div key={i} className={"ai" + (m.error ? " err" : "")}>
              <div className="who" style={{ color: info(m.provider).color }}>
                {info(m.provider).name}
              </div>
              {m.text}
            </div>
          )
        )}
        {pending.map((id) => (
          <div key={id} className="ai muted">{info(id).name} soch raha hai...</div>
        ))}
        <div ref={endRef} />
      </div>

      <Composer onSend={send} busy={pending.length > 0} />
    </div>
  );
}
