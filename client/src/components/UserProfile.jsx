// src/components/UserProfile.jsx

import React, { useEffect, useState } from 'react';
import api from '../api';

function UserProfile() {
  const [likedPosts, setLikedPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 유저 정보도 같이 보고 싶으면 (username 등)
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 내 기본 정보
        const meRes = await api.get('/users/me/');
        setUserInfo(meRes.data);

        const [likedRes, favRes, commentRes] = await Promise.all([
          api.get('/users/me/liked-posts'),
          api.get('/users/me/favorite-posts'),
          api.get('/users/me/comments'),
        ]);

        setLikedPosts(likedRes.data);
        setFavoritePosts(favRes.data);
        setMyComments(commentRes.data);
      } catch (err) {
        console.error('프로필 데이터 로드 실패:', err);
        alert('프로필 정보를 불러오는 데 실패했습니다. (로그인 여부를 확인해주세요)');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return <div style={{ marginTop: '40px' }}>프로필 정보를 불러오는 중...</div>;
  }

  if (!userInfo) {
    return <div style={{ marginTop: '40px' }}>로그인이 필요합니다.</div>;
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <h2>👤 내 프로필</h2>
      <p><b>사용자명:</b> {userInfo.username}</p>

      {/* 내가 좋아요 누른 글 섹션 */}
      <section style={{ marginTop: '20px' }}>
        <h3>❤️ 내가 좋아요 누른 글 ({likedPosts.length}개)</h3>
        {likedPosts.length === 0 ? (
          <p>아직 좋아요를 누른 게시글이 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {likedPosts.map(post => (
              <li key={post.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <strong>{post.title}</strong>
                <div style={{ fontSize: '0.9em', color: '#555' }}>
                  좋아요 수: {post.like_count}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 내가 즐겨찾기한 글 섹션 */}
      <section style={{ marginTop: '20px' }}>
        <h3>⭐ 내가 즐겨찾기한 글 ({favoritePosts.length}개)</h3>
        {favoritePosts.length === 0 ? (
          <p>아직 즐겨찾기한 게시글이 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {favoritePosts.map(post => (
              <li key={post.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <strong>{post.title}</strong>
                <div style={{ fontSize: '0.9em', color: '#555' }}>
                  좋아요 수: {post.like_count}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 내가 단 댓글 섹션 */}
      <section style={{ marginTop: '20px' }}>
        <h3>💬 내가 단 댓글 ({myComments.length}개)</h3>
        {myComments.length === 0 ? (
          <p>아직 작성한 댓글이 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {myComments.map(comment => (
              <li key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <div style={{ fontSize: '0.9em', color: '#888' }}>
                  게시글: {comment.post_title} (ID: {comment.post_id})
                </div>
                <div>{comment.content}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default UserProfile;
