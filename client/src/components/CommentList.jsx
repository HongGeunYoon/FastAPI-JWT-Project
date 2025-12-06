// src/components/CommentList.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';

function CommentList({ postId, refreshKey }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ 댓글 추천/비추천 처리
  const handleCommentVote = async (commentId, isLike) => {
    try {
      const response = await api.post(`/comments/${commentId}/vote?is_like=${isLike}`);
      const { like_count, dislike_count } = response.data;

      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, like_count, dislike_count } : c
        )
      );
    } catch (err) {
      console.error("댓글 추천 실패:", err);
      alert("추천/비추천 실패 (로그인 필요)");
    }
  };

  // ⭐ 댓글 목록 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/posts/${postId}/comments/`);
        setComments(response.data);
      } catch (err) {
        console.error("댓글 로드 실패:", err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, refreshKey]);

  if (loading)
    return <p style={{ fontSize: "0.8em", margin: "5px 0" }}>댓글 로드 중...</p>;

  return (
    <div
      style={{
        paddingLeft: "20px",
        borderLeft: "2px solid #333",
        marginTop: "15px",
      }}
    >
      <h4 style={{ marginBottom: "10px", color: "#ddd" }}>💬 댓글 ({comments.length}개)</h4>

      {comments.length === 0 ? (
        <p style={{ fontSize: "0.8em", color: "#888" }}>아직 댓글이 없습니다.</p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              background: "#1c1c1c",
              border: "1px solid #444",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          >
            {/* 댓글 내용 */}
            <p style={{ margin: 0, color: "#eee", whiteSpace: "pre-wrap" }}>
              {comment.content}
            </p>

            {/* 작성자 */}
            <small style={{ color: "#777" }}>작성자 ID: {comment.owner_id}</small>

            {/* 👍 추천 / 👎 비추천 */}
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {/* 👍 추천 버튼 */}
              <button
                onClick={() => handleCommentVote(comment.id, true)}
                style={{
                  padding: "5px 10px",
                  background: "#222",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#ddd",
                }}
              >
                👍 추천
              </button>

              {/* 👎 비추천 버튼 */}
              <button
                onClick={() => handleCommentVote(comment.id, false)}
                style={{
                  padding: "5px 10px",
                  background: "#222",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#ddd",
                }}
              >
                👎 비추천
              </button>

              {/* 추천/비추천 카운트 */}
              <span style={{ color: "#ccc", marginLeft: "6px" }}>
                👍 {comment.like_count || 0} / 👎 {comment.dislike_count || 0}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default CommentList;
