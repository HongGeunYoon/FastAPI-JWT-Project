// src/components/PostList.jsx

import React, { useState, useEffect,useCallback} from 'react';
import api from '../api';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

function PostList({ refreshKey }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚨 2. 댓글 목록 새로고침을 위한 상태 (refreshKey가 변경되면 CommentList가 재로드됨)
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);

  // 🚨 3. 댓글 작성 성공 시 호출될 콜백 함수
  const handleCommentCreated = useCallback(() => {
    setCommentRefreshKey(prevKey => prevKey + 1);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 🚨 GET /posts/ 엔드포인트 호출 (인증 불필요.)
        const response = await api.get('/posts/');
        
        // 데이터가 성공적으로 로드되면 상태 업데이트
        setPosts(response.data);
      } catch (err) {
        console.error("게시글 로드 실패:", err);
        setError('게시글 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refreshKey]);

  if (loading) return <p>게시글을 불러오는 중...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ marginTop: '40px' }}>
      <h2>📋 게시글 목록 ({posts.length}개)</h2>
      {posts.length === 0 ? (
        <p>게시글이 없습니다. 글을 작성해 보세요!</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {posts.map(post => (
            <li 
              key={post.id} 
              style={{ border: '1px solid #eee', margin: '10px 0', padding: '15px' }}
            >
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              <small>작성자 ID: {post.owner_id}</small>
              <CommentList postId={post.id} refreshKey={commentRefreshKey} />
              <CommentForm
                postId={post.id}
                onCommentCreated={handleCommentCreated}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PostList;