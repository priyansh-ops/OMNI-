import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, login, logout, loadKeys, saveKeys } from "./firebase";
import Keys from "./components/Keys";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [keys, setKeys] = useState({});
  const [showKeys, setShowKeys] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          const k = await loadKeys(u.uid);
          setKeys(k);
          setShowKeys(!Object.values(k).some(Boolean));
        }
      }),
    []
  );

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
        <b>Omni</b>
        <div className="row">
          <button onClick={() => setShowKeys(true)}>Keys</button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
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
        <div className="center">Login aur keys ready hain. Chat agle batch me.</div>
      )}
    </div>
  );
}
