// client/src/components/CommentList.jsx 파일에 아래 내용을 모두 덮어쓰고 저장합니다.

import React, { useState, useEffect } from 'react';
import api from '../api';

function CommentList({ postId, refreshKey }) { 
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/posts/${postId}/comments/`);
        setComments(response.data);
      } catch (err) {
        console.error(`댓글 로드 실패 (Post ID: ${postId}):`, err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId, refreshKey]); 

  if (loading) return <p style={{ fontSize: '0.8em', margin: '5px 0' }}>댓글 로드 중...</p>;

  return (
    <div style={{ paddingLeft: '20px', borderLeft: '2px solid #ddd', marginTop: '10px' }}>
      <h5 style={{ margin: '0 0 10px 0' }}>댓글 ({comments.length}개)</h5>
      {comments.length === 0 ? (
        <p style={{ fontSize: '0.8em', color: '#888' }}>아직 댓글이 없습니다.</p>
      ) : (
        comments.map(comment => (
          <div key={comment.id} style={{ borderBottom: '1px dotted #eee', padding: '5px 0' }}>
            <p style={{ margin: '0' }}>{comment.content}</p>
            <small style={{ color: '#aaa' }}>
              작성자 ID: {comment.owner_id}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default CommentList;