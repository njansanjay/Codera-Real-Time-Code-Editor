import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const [showJoin, setShowJoin] = useState(false);
  const [roomInput, setRoomInput] = useState("");

  // 🔥 Create Room
  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${roomId}`);
  };

  // 🔥 Join Room
  const joinRoom = () => {
    if (!roomInput.trim()) return;
    navigate(`/room/${roomInput}`);
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(to right, #2c3e50, #4ca1af)",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* NAVBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        Codera
      </div>

      {/* CENTER CONTENT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
          Share Code in Real-time
        </h1>

        <p
          style={{
            fontSize: "18px",
            marginBottom: "30px",
            opacity: 0.8,
          }}
        >
          Collaborate, code and run programs together instantly
        </p>

        {/* CREATE BUTTON */}
        <button
          onClick={createRoom}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            background: "#ff4d6d",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Create Room
        </button>

        {/* JOIN BUTTON */}
        <button
          onClick={() => setShowJoin(true)}
          style={{
            marginTop: "15px",
            padding: "12px 30px",
            fontSize: "16px",
            background: "#222",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Join Room
        </button>
      </div>

      {/* 🔥 JOIN POPUP */}
      {showJoin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              padding: "30px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>Enter Room Code</h3>

            <input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Enter Room ID"
              style={{
                padding: "10px",
                width: "200px",
                marginBottom: "15px",
                borderRadius: "5px",
                border: "none",
              }}
            />

            <br />

            <button
              onClick={joinRoom}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                background: "#4caf50",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              Join
            </button>

            <button
              onClick={() => setShowJoin(false)}
              style={{
                padding: "10px 20px",
                background: "#ff4d4d",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <br /><br />
          <p style={{ marginTop: "10px" }}>
  Don't have Room ID?{" "}
  <span
    onClick={() => {
      setShowJoin(false);   
      createRoom();         
    }}
    style={{
      color: "#4caf50",
      cursor: "pointer",
      textDecoration: "underline"
    }}
  >
    <br />
    Create one
  </span>
</p>
          </div>
          
        </div>
      )}
    </div>
  );
}

export default HomePage;