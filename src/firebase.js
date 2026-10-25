import { initializeApp } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBC4YuD6rjfp12fCXAX6ieI1cI7gu1-f9c",
  authDomain: "omni-6bb34.firebaseapp.com",
  projectId: "omni-6bb34",
  storageBucket: "omni-6bb34.firebasestorage.app",
  messagingSenderId: "755185510316",
  appId: "1:755185510316:web:90c44f5a611ba1eacf7c09",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { onAuthStateChanged };

export const login = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logout = () => signOut(auth);

export async function loadKeys(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().keys || {} : {};
}

export async function saveKeys(uid, keys) {
  await setDoc(doc(db, "users", uid), { keys }, { merge: true });
}

export async function listChats(uid) {
  const q = query(
    collection(db, "users", uid, "chats"),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveChat(uid, chat) {
  await setDoc(doc(db, "users", uid, "chats", chat.id), {
    title: chat.title,
    messages: chat.messages,
    updatedAt: Date.now(),
  });
}
