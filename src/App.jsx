import { useEffect, useState } from "react";
import {
  auth, onAuthStateChanged, login, logout, loadKeys, saveKeys, listChats, saveChat,
} from "./firebase";
import Keys from "./components/Keys";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";

const newChat = () => ({ id: String(Date.now()), title: "", messages: [] });

export default function App() {
  const [user, setUser] = useState(undefined);
  const [keys, setKeys] = useState({});
  const [showKeys, setShowKeys] = useState(false);
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState(newChat());
  const [menu, setMenu] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          const k = await loadKeys(u.uid);
          setKeys(k);
          setShowKeys(!Object.values(k).some(Boolean));
          setChats(await listChats(u.uid).catch(() => []));
        }
      }),
    []
  );

  async function handleSave(c) {
    setChat(c);
    setChats((prev) => [c, ...prev.filter((x) => x.id !== c.id)]);
    try {
      await saveChat(user.uid, c);
    } catch (e) {
      console.error(e);
    }
  }

  function openChat(id) {
    const c = chats.find((x) => x.id === id);
    if (c) setChat(c);
    setShowKeys(false);
    setMenu(false);
  }

  function startNew() {
    setChat(newChat());
    setShowKeys(false);
    setMenu(false);
  }

  if (user === undefined) return <div className="center">Loading...</div>;

  if (user === null)
    return (
      <div className="center">
        <h1>Omni</h1>
        <p className="muted">Saare AI, ek jagah.</p>
        <button className="primary" onClick={() => login().catch((e) => alert(e.message))}>
          Google se login
        </button>
      </div>
    );

  return (
    <div className="app">
      <header>
        <div className="row">
          <button onClick={() => setMenu(true)}>☰</button>
          <b className="logo">Omni</b>
        </div>
        <div className="row">
          <button onClick={() => setShowKeys(true)}>Keys</button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {menu && (
        <Sidebar
          chats={chats}
          currentId={chat.id}
          onNew={startNew}
          onOpen={openChat}
          onClose={() => setMenu(false)}
        />
      )}

      {showKeys ? (
        <Keys
          keys={keys}
          onClose={Object.values(keys).some(Boolean) ? () => setShowKeys(false) : null}
          onSave={async (k) => {
            await saveKeys(user.uid, k);
            setKeys(k);
            setShowKeys(false);
          }}
        />
      ) : (
        <Chat key={chat.id} chat={chat} keys={keys} onSave={handleSave} />
      )}
    </div>
  );
}
