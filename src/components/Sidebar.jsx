export default function Sidebar({ chats, currentId, onNew, onOpen, onClose }) {
  return (
    <div className="sidebar">
      <div className="row">
        <button className="primary" onClick={onNew}>+ New chat</button>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="muted">Purane chats</div>
      {chats.length === 0 && <p className="muted">Abhi koi chat nahi.</p>}
      {chats.map((c) => (
        <button
          key={c.id}
          className={"chatitem" + (c.id === currentId ? " active" : "")}
          onClick={() => onOpen(c.id)}
        >
          {c.title || "Naya chat"}
        </button>
      ))}
    </div>
  );
}
