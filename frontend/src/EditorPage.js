import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Editor from "@monaco-editor/react";

let stompClient = null;

function EditorPage() {
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

        // SEND JOIN EVENT
        client.publish({
          destination: "/app/join",
          body: JSON.stringify({ roomId }),
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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <button onClick={copyLink}>Copy Room Link</button>
      <p>Users online: {users}</p>
      {typing && <p>Someone is typing...</p>}

      <Editor
        height="500px"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => sendCode(value)}
      />
    </div>
  );
}

export default EditorPage;