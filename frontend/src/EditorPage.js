import React, { useEffect, useState, useRef } from "react";
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
  const [currentInput, setCurrentInput] = useState("");

  const [stompClient, setStompClient] = useState(null);

  const terminalRef = useRef(null);

  // 🔥 CONNECT WEBSOCKET
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),

      onConnect: () => {
        setStompClient(client);

        // terminal output
        client.subscribe("/topic/terminal", (msg) => {
          setTerminal((prev) => prev + msg.body);
        });

        // start terminal initially
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

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminal, currentInput]);

  // 🔥 AUTO FOCUS TERMINAL
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.focus();
    }
  }, []);

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

    setTerminal("> Running...\n");
    setCurrentInput("");

    await fetch("http://localhost:8080/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, language: "python" }),
    });

    stompClient.publish({
      destination: "/app/terminal/start",
    });

    if (terminalRef.current) {
      terminalRef.current.focus();
    }
  };

  // 🔥 TERMINAL KEY HANDLER
  const handleKeyDown = (e) => {
    if (!stompClient) return;

    if (e.key === "Enter") {
      e.preventDefault();

      stompClient.publish({
        destination: "/app/terminal/input",
        body: currentInput,
      });

      
      setCurrentInput("");
    } else if (e.key === "Backspace") {
      e.preventDefault();
      setCurrentInput((prev) => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      setCurrentInput((prev) => prev + e.key);
    }
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

      <div
        ref={terminalRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          outline: "none",
          background: "black",
          color: "lime",
          height: "200px",
          overflow: "auto",
          marginTop: "10px",
          padding: "10px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
{terminal}
<span style={{ color: "white" }}>{currentInput}</span>
<span style={{ background: "lime", width: "8px", display: "inline-block" }}></span>
      </div>
    </div>
  );
}

export default EditorPage;