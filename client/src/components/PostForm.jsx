// src/components/PostForm.jsx

import React, { useState } from 'react';
import api from '../api';

function PostForm({ onPostCreated }) { // 🚨 글 작성 후 목록 새로고침을 위한 콜백 함수 받기
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // 🚨 1. 토큰이 없으면 글 작성을 막습니다.
    if (!localStorage.getItem('access_token')) {
      setMessage('오류: 글을 작성하려면 먼저 로그인해야 합니다.');
      return;
    }

    try {
      // 2. 🚨 POST /posts/ 엔드포인트 호출 (JSON 형식)
      await api.post('/posts/', {
        title,
        content,
      });

      setMessage('게시글이 성공적으로 작성되었습니다.');
      setTitle('');
      setContent('');
      
      // 3. 🚨 글 작성 성공 후, 부모 컴포넌트에 알림 (게시글 목록 새로고침 유도)
      if (onPostCreated) {
        onPostCreated(); 
      }

    } catch (error) {
      console.error('글 작성 실패:', error);
      // 서버에서 401 Unauthorized 등의 오류가 오면 처리
      const detail = error.response?.data?.detail || '게시글 작성 요청에 실패했습니다.';
      setMessage(`작성 실패: ${detail}`);
    }
  };

  return (
    <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #ccc' }}>
      <h2>✏️ 새 게시글 작성</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px', height: '100px' }}
        />
        <button type="submit" disabled={!localStorage.getItem('access_token')}>
          {localStorage.getItem('access_token') ? '게시글 작성' : '로그인 후 작성 가능'}
        </button>
      </form>
      {message && <p style={{ color: message.includes('성공') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default PostForm;