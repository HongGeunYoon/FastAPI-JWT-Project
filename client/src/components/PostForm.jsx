// src/components/PostForm.jsx — Dark Theme Version

import React, { useState } from 'react';
import api from '../api';

function PostForm({ onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const isLogged = Boolean(localStorage.getItem('access_token'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isLogged) {
      setMessage('오류: 글을 작성하려면 먼저 로그인해야 합니다.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setMessage('오류: 제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await api.post('/posts/', { title, content });

      setMessage('게시글이 성공적으로 작성되었습니다.');
      setTitle('');
      setContent('');

      if (onPostCreated) onPostCreated();

    } catch (error) {
      console.error('글 작성 실패:', error);
      const detail = error.response?.data?.detail || '게시글 작성 요청에 실패했습니다.';
      setMessage(`작성 실패: ${detail}`);
    }
  };

  return (
    <div
      style={{
        margin: '30px 0',
        padding: '20px',
        background: '#2a2a2a',
        borderRadius: '10px',
        border: '1px solid #444',
        color: '#eee'
      }}
    >
      <h2 style={{ marginTop: 0, color: '#fff' }}>새 게시글 작성</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* 제목 입력 */}
        <input
          type="text"
          placeholder="제목을 입력하세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isLogged}
          style={{
            padding: '10px',
            marginBottom: '12px',
            fontSize: '1em',
            borderRadius: '6px',
            border: '1px solid #555',
            background: isLogged ? '#333' : '#555',
            color: '#eee'
          }}
        />

        {/* 내용 입력 */}
        <textarea
          placeholder={isLogged ? "내용을 입력하세요." : "로그인 후 작성 가능합니다."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isLogged}
          style={{
            padding: '10px',
            marginBottom: '12px',
            minHeight: '120px',
            fontSize: '1em',
            borderRadius: '6px',
            border: '1px solid #555',
            background: isLogged ? '#333' : '#555',
            color: '#eee'
          }}
        />

        {/* 작성 버튼 */}
        <button
          type="submit"
          disabled={!isLogged}
          style={{
            padding: '10px',
            fontSize: '1em',
            cursor: isLogged ? 'pointer' : 'not-allowed',
            background: isLogged ? '#3b82f6' : '#777',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          {isLogged ? '게시글 작성' : '로그인 후 작성 가능'}
        </button>
      </form>

      {/* 성공/오류 메시지 */}
      {message && (
        <p
          style={{
            marginTop: '12px',
            color: message.includes('성공') ? '#22c55e' : '#ef4444',
            fontWeight: 500
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default PostForm;
