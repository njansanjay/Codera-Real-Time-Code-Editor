import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Editor from "@monaco-editor/react";


let stompClient = null;

function EditorPage() {
  const [terminal, setTerminal] = useState("");
  const [input, setInput] = useState("");
  const { roomId } = useParams();

  const [code, setCode] = useState("");
  const [users, setUsers] = useState(1);
  const [typing, setTyping] = useState(false);
  
  
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,

      onConnect: () => {
        // CODE SYNC
        client.subscribe(`/topic/code/${roomId}`, (message) => {
          const data = JSON.parse(message.body);
          setCode(data.content);
        });

        client.subscribe(`/topic/users/${roomId}`, (msg) => {
            setUsers(Number(msg.body));
        });

        // TYPING
        client.subscribe(`/topic/typing/${roomId}`, () => {
          setTyping(true);
          setTimeout(() => setTyping(false), 1000);
        });

        // 🔥 START TERMINAL
        client.publish({
          destination: "/app/terminal/start",
        });

        // SEND JOIN EVENT
        client.publish({
          destination: "/app/join",
          body: JSON.stringify({ roomId }),
        });
        // 🔥 TERMINAL OUTPUT
        client.subscribe("/topic/terminal", (msg) => {
          setTerminal((prev) => prev + "\n" + msg.body);
        });
      },
    });

    client.activate();
    stompClient = client;

    return () => {
      if (client.connected) {
        client.publish({
          destination: "/app/leave",
          body: JSON.stringify({ roomId }),
        });
      }
      client.deactivate();
    };
  }, [roomId]);

  const sendCode = (newCode) => {
    if (!newCode) return;

    setCode(newCode);

    stompClient.publish({
      destination: "/app/code",
      body: JSON.stringify({
        content: newCode,
        roomId: roomId,
      }),
    });

    stompClient.publish({
      destination: "/app/typing",
      body: JSON.stringify({ roomId }),
    });
  };

  const runCode = async () => {
    // 1. Clear terminal visually (optional but useful)
    setTerminal(prev => prev + "\n> Running...\n");

    // 2. Save file
    await fetch("http://localhost:8080/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          code: code,
          language: "python"
        }),
      });

    // 3. SMALL DELAY (IMPORTANT)
    setTimeout(() => {
      stompClient.publish({
        destination: "/app/terminal/input",
        body: "python -u temp.py"
      });
    }, 100);
  };
  
  const sendTerminalInput = (e) => {
    if (e.key === "Enter") {
      const value = e.target.value.trim();

      if (!value) return; // ignore empty input

      stompClient.publish({
        destination: "/app/terminal/input",
        body: value,
      });

      e.target.value = "";
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  return (
  <div>
    {/* EDITOR */}
    <Editor
      height="400px"
      theme="vs-dark"
      value={code}
      onChange={sendCode}
    />

    {/* <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Enter program input"
      style={{
        marginTop: "10px",
        width: "100%",
        padding: "5px"
      }}
    /> */}

    {/* RUN BUTTON */}
    <button 
      onClick={runCode}
      style={{
        marginTop: "10px",
        padding: "8px 16px",
        background: "green",
        color: "white",
        border: "none",
        cursor: "pointer"
      }}
    >
      ▶ Run Code
    </button>

    {/* TERMINAL */}
    <div style={{
      background: "black",
      color: "lime",
      padding: "10px",
      marginTop: "10px",
      height: "200px",
      overflowY: "auto"
    }}>
      <pre>{terminal}</pre>

      <input
        type="text"
        onKeyDown={sendTerminalInput}
        placeholder="Type command and press Enter"
        style={{
          width: "100%",
          background: "black",
          color: "white",
          border: "none",
          outline: "none"
        }}
      />
    </div>
  </div>
);
}

export default EditorPage;