// src/components/PostList.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]); // 내가 좋아요한 게시글 목록 저장
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 게시글 불러오기
  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts/');
      setPosts(response.data);
    } catch (err) {
      console.error("게시글 로드 실패:", err);
      setError('게시글 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ❤️ 좋아요 기능
  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      const liked = response.data.liked;

      // likedPosts 상태 업데이트
      setLikedPosts((prev) =>
        liked
          ? [...prev, postId] // 좋아요 추가
          : prev.filter((id) => id !== postId) // 좋아요 취소
      );

      // 좋아요 수 반영을 위해 게시글 재호출
      fetchPosts();
    } catch (err) {
      console.error("좋아요 실패:", err);
      alert("좋아요 실패! (로그인 필요)");
    }
  };

  // ⭐ 즐겨찾기 기능
  const handleFavorite = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/favorite`);
      const fav = response.data.favorited;

      alert(fav ? "⭐ 즐겨찾기 추가됨!" : "⭐ 즐겨찾기 취소됨!");
    } catch (err) {
      console.error("즐겨찾기 실패:", err);
      alert("즐겨찾기 실패! (로그인 필요)");
    }
  };

  if (loading) return <p>게시글을 불러오는 중...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ marginTop: '40px' }}>
      <h2>📋 게시글 목록 ({posts.length}개)</h2>

      {posts.length === 0 ? (
        <p>게시글이 없습니다. 글을 작성해 보세요!</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {posts.map(post => {
            const isLiked = likedPosts.includes(post.id); // 내가 좋아요 눌렀는지 확인

            return (
              <li 
                key={post.id} 
                style={{ border: '1px solid #eee', margin: '10px 0', padding: '15px' }}
              >
                <h4>{post.title}</h4>
                <p>{post.content}</p>
                <small>작성자 ID: {post.owner_id}</small>

                {/* ❤️ 좋아요 / ⭐ 즐겨찾기 버튼 */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  
                  {/* ❤️ 좋아요 버튼 */}
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      background: isLiked ? 'pink' : 'white',
                      color: isLiked ? 'red' : 'black',
                      border: isLiked ? '2px solid red' : '1px solid #ccc',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                  >
                    ❤️ 좋아요
                  </button>

                  {/* ⭐ 즐겨찾기 버튼 */}
                  <button
                    onClick={() => handleFavorite(post.id)}
                    style={{
                      padding: '6px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                  >
                    ⭐ 즐겨찾기
                  </button>

                  {/* 👍 좋아요 수 표시 */}
                  <span style={{ marginLeft: '10px', color: '#444' }}>
                    👍 좋아요 수: {post.likes_count || 0}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default PostList;
