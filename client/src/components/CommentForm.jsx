// src/components/CommentForm.jsx

import React, { useState } from 'react';
import api from '../api';

function CommentForm({ postId, onCommentCreated }) { // postId와 콜백 함수를 받습니다.
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  
  // 로그인 상태 확인 (토큰 유무)
  const isLogged = localStorage.getItem('access_token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // 비로그인 사용자 방지
    if (!isLogged) {
      setMessage('오류: 댓글을 작성하려면 로그인해야 합니다.');
      return;
    }
    
    // 내용이 비어있는지 확인
    if (!content.trim()) {
        setMessage('오류: 내용을 입력해 주세요.');
        return;
    }

    try {
      // 🚨 POST /posts/{post_id}/comments/ 엔드포인트 호출 (토큰 자동 포함됨)
      await api.post(`/posts/${postId}/comments/`, {
        content: content,
      });

      setMessage('댓글이 성공적으로 작성되었습니다.');
      setContent('');
      
      // 댓글 작성 성공 후, 부모 컴포넌트에 알림 (목록 새로고침 유도)
      if (onCommentCreated) {
        onCommentCreated(); 
      }

    } catch (error) {
      console.error('댓글 작성 실패:', error);
      // 서버에서 받은 상세 오류 메시지 추출
      const detail = error.response?.data?.detail || '댓글 작성 요청에 실패했습니다.';
      setMessage(`작성 실패: ${detail}`);
    }
  };

  return (
    <div style={{ marginTop: '15px', padding: '10px 0' }}>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={isLogged ? "댓글을 입력하세요." : "로그인 후 댓글 작성이 가능합니다."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={!isLogged} // 로그인하지 않으면 비활성화
          style={{ width: '100%', padding: '8px', marginBottom: '8px', minHeight: '50px' }}
        />
        <button type="submit" disabled={!isLogged || !content.trim()}>
          댓글 작성
        </button>
      </form>
      {message && <p style={{ fontSize: '0.8em', color: message.includes('성공') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default CommentForm;