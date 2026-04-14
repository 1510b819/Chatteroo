import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader
} from "@chatscope/chat-ui-kit-react";

import { useState, useEffect } from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "./firebase";

export default function Chat() {

  // 🔐 PASSWORD GATE STATE
  const SECRET = "1234";

  const [unlocked, setUnlocked] = useState(
    localStorage.getItem("chat-unlocked") === "true"
  );

  const [password, setPassword] = useState("");

  // 💬 CHAT STATE
  const [messages, setMessages] = useState([]);

  // 🔐 SIMPLE ENCRYPTION (XOR + base64)
  const SECRET_KEY = "gf-secret-key";

  const encrypt = (text) => {
    return btoa(
      text
        .split("")
        .map((c, i) =>
          String.fromCharCode(
            c.charCodeAt(0) ^
            SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
          )
        )
        .join("")
    );
  };

  const decrypt = (text) => {
    return atob(text)
      .split("")
      .map((c, i) =>
        String.fromCharCode(
          c.charCodeAt(0) ^
          SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
        )
      )
      .join("");
  };

  // 🔁 REALTIME FIRESTORE LISTENER
  useEffect(() => {
    if (!unlocked) return;

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsubscribe();
  }, [unlocked]);

  // 🔐 UNLOCK CHAT
  const unlock = () => {
    if (password === SECRET) {
      localStorage.setItem("chat-unlocked", "true");
      setUnlocked(true);
    } else {
      alert("Wrong password");
    }
  };

  // 📤 SEND MESSAGE (ENCRYPTED)
  const handleSend = async (text) => {
    if (!text.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: encrypt(text), // 🔐 stored encrypted
      sender: "You",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      createdAt: serverTimestamp()
    });
  };

  // 🧹 CLEAR CHAT
  const clearChat = async () => {
    const snapshot = await getDocs(collection(db, "messages"));

    snapshot.forEach(async (d) => {
      await deleteDoc(doc(db, "messages", d.id));
    });
  };

  // 🔐 PASSWORD SCREEN
  if (!unlocked) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f0f0f",
        color: "white",
        gap: "10px"
      }}>
        <h2>💬 Private Chat</h2>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none"
          }}
        />

        <button
          onClick={unlock}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Enter
        </button>
      </div>
    );
  }

  // 💬 CHAT UI
  return (
    <div style={{
      height: "100vh",
      background: "#0f0f0f"
    }}>

      <MainContainer style={{
        borderRadius: "12px",
        overflow: "hidden"
      }}>

        <ChatContainer style={{
          backgroundColor: "#111"
        }}>

          {/* HEADER */}
          <ConversationHeader>

            <ConversationHeader.Content
              userName="Chatteroo 💬"
              info="Encrypted Private Chat"
            />

            <ConversationHeader.Actions>
              <button
                onClick={clearChat}
                style={{
                  background: "transparent",
                  color: "#ff6b6b",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "6px 10px"
                }}
              >
                Clear
              </button>
            </ConversationHeader.Actions>

          </ConversationHeader>

          {/* MESSAGES */}
          <MessageList
            autoScrollToBottom
            scrollBehavior="smooth"
          >

            {messages.map((msg) => (
              <Message
                key={msg.id}
                model={{
                  message: decrypt(msg.text), // 🔓 decrypted
                  sender: msg.sender,
                  direction:
                    msg.sender === "You"
                      ? "outgoing"
                      : "incoming",
                  sentTime: msg.time,
                  position: "single"
                }}
              />
            ))}

          </MessageList>

          {/* INPUT */}
          <MessageInput
            placeholder="Type message..."
            onSend={handleSend}
          />

        </ChatContainer>

      </MainContainer>

    </div>
  );
}