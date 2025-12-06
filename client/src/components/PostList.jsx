// src/components/PostList.jsx

import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

function PostList({ refreshKey }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 댓글 새로고침 키
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const handleCommentCreated = useCallback(() => {
    setCommentRefreshKey((prev) => prev + 1);
  }, []);

  // --------------------------
  // 📌 게시글 불러오기
  // --------------------------
  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts/");
      console.log("📌 서버 게시글:", response.data);

      setPosts(response.data); // like_count, liked 포함
    } catch (err) {
      console.error("게시글 로드 실패:", err);
      setError("게시글 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshKey, commentRefreshKey]);

  // --------------------------
  // ❤️ 좋아요
  // --------------------------
  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      const { like_count, liked } = res.data;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, like_count, liked } : p
        )
      );
    } catch (err) {
      alert("좋아요 실패 (로그인 필요)");
    }
  };

  // --------------------------
  // ⭐ 즐겨찾기
  // --------------------------
  const handleFavorite = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/favorite`);
      alert(res.data.favorited ? "⭐ 즐겨찾기 추가됨" : "⭐ 즐겨찾기 취소됨");
    } catch (err) {
      alert("즐겨찾기 실패 (로그인 필요)");
    }
  };

  if (loading) return <p>게시글을 불러오는 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>📋 게시글 목록 ({posts.length}개)</h2>

      {posts.length === 0 ? (
        <p>게시글이 없습니다. 글을 작성해 보세요!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              {/* 제목 */}
              <h3 style={{ marginBottom: "8px" }}>{post.title}</h3>

              {/* 내용 */}
              <p style={{ whiteSpace: "pre-wrap", marginTop: "0" }}>
                {post.content}
              </p>

              {/* 작성자 */}
              <small style={{ color: "#aaa" }}>
                작성자 ID: {post.owner_id}
              </small>

              {/* ❤️ 좋아요 + ⭐ 즐겨찾기 */}
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                {/* ❤️ 좋아요 버튼 */}
                <button
                  onClick={() => handleLike(post.id)}
                  style={{
                    padding: "7px 14px",
                    background: post.liked ? "#ffccd5" : "#222",
                    border: post.liked
                      ? "2px solid #ff4d6d"
                      : "1px solid #444",
                    color: post.liked ? "#b3002d" : "#ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  ❤️ 좋아요
                </button>

                {/* ⭐ 즐겨찾기 버튼 */}
                <button
                  onClick={() => handleFavorite(post.id)}
                  style={{
                    padding: "7px 14px",
                    background: "#222",
                    border: "1px solid #444",
                    color: "#ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  ⭐ 즐겨찾기
                </button>

                {/* 👍 좋아요 수 */}
                <span style={{ color: "#ddd", fontSize: "15px" }}>
                  👍 {post.like_count ?? 0}
                </span>
              </div>

              {/* 댓글 목록 */}
              <CommentList
                postId={post.id}
                refreshKey={commentRefreshKey}
              />

              {/* 댓글 작성 */}
              <CommentForm
                postId={post.id}
                onCommentCreated={handleCommentCreated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostList;
