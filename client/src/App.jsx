// src/App.jsx

import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import UserInfo from "./components/UserInfo";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import UserProfile from "./components/UserProfile";

import "./App.css";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("home");

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="App" style={{ margin: "50px" }}>
      <h1>FastAPI + React 커뮤니티</h1>

      {/* ⭐ 탭 버튼 영역 */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <button
          onClick={() => setActiveTab("home")}
          style={{
            padding: "10px 15px",
            cursor: "pointer",
            background: activeTab === "home" ? "#222" : "#eee",
            color: activeTab === "home" ? "#fff" : "#000",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
          }}
        >
          🏠 홈
        </button>

        <button
          onClick={() => setActiveTab("auth")}
          style={{
            padding: "10px 15px",
            cursor: "pointer",
            background: activeTab === "auth" ? "#222" : "#eee",
            color: activeTab === "auth" ? "#fff" : "#000",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
          }}
        >
          🔐 로그인 / 회원가입
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          style={{
            padding: "10px 15px",
            cursor: "pointer",
            background: activeTab === "profile" ? "#222" : "#eee",
            color: activeTab === "profile" ? "#fff" : "#000",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
          }}
        >
          👤 내 프로필
        </button>
      </div>

      {/* -------------------------------------------------- */}
      {/* ⭐ 탭별 화면 렌더링 */}
      {/* -------------------------------------------------- */}

      {/* 🏠 홈 탭 */}
      {activeTab === "home" && (
        <>
          <UserInfo /> {/* 현재 로그인된 사용자 정보 */}
          <PostForm onPostCreated={handlePostCreated} />
          <PostList key={refreshKey} />
        </>
      )}

      {/* 🔐 로그인 / 회원가입 탭 */}
      {activeTab === "auth" && (
        <div>
          <h2>🔐 로그인 / 회원가입</h2>
          <SignupForm />
          <LoginForm />
        </div>
      )}

      {/* 👤 내 프로필 탭 */}
      {activeTab === "profile" && (
        <div>
          <h2>👤 내 프로필</h2>
          <UserInfo />
          <UserProfile />
        </div>
      )}
    </div>
  );
}

export default App;
