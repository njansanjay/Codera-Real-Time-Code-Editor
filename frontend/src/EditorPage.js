import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Editor from "@monaco-editor/react";

function EditorPage() {
  const { roomId } = useParams();

  const [code, setCode] = useState("");
  const [users, setUsers] = useState(1);
  const [typing, setTyping] = useState(false);

  const [terminal, setTerminal] = useState("");
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);

  // 🔥 CONNECT WEBSOCKET
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),

      onConnect: () => {
        setStompClient(client);

        // terminal output
        client.subscribe("/topic/terminal", (msg) => {
          setTerminal((prev) => prev + msg.body + "\n");
        });

        // start terminal
        client.publish({
          destination: "/app/terminal/start",
        });

        // join room
        client.publish({
          destination: "/app/join",
          body: JSON.stringify({ roomId }),
        });

        // users
        client.subscribe(`/topic/users/${roomId}`, (msg) => {
          setUsers(Number(msg.body));
        });

        // code sync
        client.subscribe(`/topic/code/${roomId}`, (msg) => {
          const data = JSON.parse(msg.body);
          setCode(data.content);
        });

        // typing
        client.subscribe(`/topic/typing/${roomId}`, () => {
          setTyping(true);
          setTimeout(() => setTyping(false), 1000);
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [roomId]);

  // 🔥 SEND CODE
  const sendCode = (value) => {
    setCode(value);
    if (!stompClient) return;

    stompClient.publish({
      destination: "/app/code",
      body: JSON.stringify({
        roomId,
        content: value,
      }),
    });

    stompClient.publish({
      destination: "/app/typing",
      body: JSON.stringify({ roomId }),
    });
  };

  // 🔥 RUN CODE
  const runCode = async () => {
    if (!stompClient) return;

    setTerminal((prev) => prev + "\n> Running...\n");

    await fetch("http://localhost:8080/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, language: "python" }),
    });

    stompClient.publish({
      destination: "/app/terminal/input",
      body: "python temp.py",
    });
  };

  // 🔥 SEND INPUT
  const sendInput = () => {
    if (!stompClient || !input.trim()) return;

    stompClient.publish({
      destination: "/app/terminal/input",
      body: input,
    });

    setInput("");
  };

  // 🔥 COPY LINK
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  return (
    <div>
      <div style={{ color: "white", background: "#222", padding: "8px" }}>
        👥 Users in room: {users}
      </div>

      <button onClick={copyLink} style={{ margin: "10px" }}>
        🔗 Copy Room Link
      </button>

      <Editor
        height="400px"
        theme="vs-dark"
        value={code}
        onChange={sendCode}
      />

      <button
        onClick={runCode}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          background: "green",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        ▶ Run Code
      </button>

      <pre
        style={{
          background: "black",
          color: "lime",
          height: "200px",
          overflow: "auto",
          marginTop: "10px",
        }}
      >
        {terminal}
      </pre>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type input..."
        style={{ width: "80%", padding: "5px" }}
      />

      <button onClick={sendInput}>Send</button>
    </div>
  );
}

export default EditorPage;