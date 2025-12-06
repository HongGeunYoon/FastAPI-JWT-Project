// src/components/CommentForm.jsx

import React, { useState } from 'react';
import api from '../api';

function CommentForm({ postId, onCommentCreated }) {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  // 로그인 여부
  const isLogged = localStorage.getItem("access_token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isLogged) {
      setMessage("오류: 댓글을 작성하려면 로그인해야 합니다.");
      return;
    }

    if (!content.trim()) {
      setMessage("오류: 내용을 입력해 주세요.");
      return;
    }

    try {
      await api.post(`/posts/${postId}/comments/`, { content });

      setMessage("댓글이 성공적으로 작성되었습니다.");
      setContent("");

      onCommentCreated?.(); // 댓글 새로고침
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      const detail =
        error.response?.data?.detail || "댓글 작성 요청에 실패했습니다.";
      setMessage(`작성 실패: ${detail}`);
    }
  };

  return (
    <div
      style={{
        marginTop: "15px",
        padding: "15px",
        background: "#1b1b1b",
        border: "1px solid #333",
        borderRadius: "8px",
      }}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={
            isLogged ? "댓글을 입력하세요." : "로그인 후 댓글 작성이 가능합니다."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={!isLogged}
          style={{
            width: "100%",
            padding: "10px",
            minHeight: "60px",
            background: "#111",
            border: "1px solid #444",
            borderRadius: "6px",
            color: "#eee",
            resize: "vertical",
          }}
        />

        <button
          type="submit"
          disabled={!isLogged || !content.trim()}
          style={{
            marginTop: "10px",
            padding: "8px 14px",
            background: isLogged ? "#222" : "#333",
            border: "1px solid #555",
            borderRadius: "6px",
            color: isLogged ? "#ddd" : "#666",
            cursor: isLogged ? "pointer" : "not-allowed",
            width: "120px",
          }}
        >
          댓글 작성
        </button>
      </form>

      {message && (
        <p
          style={{
            fontSize: "0.85em",
            marginTop: "10px",
            color: message.includes("성공") ? "#4caf50" : "#ff5555",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default CommentForm;
