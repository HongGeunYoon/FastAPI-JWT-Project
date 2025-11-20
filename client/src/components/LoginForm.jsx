// src/components/LoginForm.jsx

import React, { useState } from 'react';
import api from '../api'; // 👈 위에서 생성한 api 인스턴스 임포트

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    // FormData를 사용하여 application/x-www-form-urlencoded 형식으로 데이터 준비
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      // 🚨 POST /token 엔드포인트 호출
      const response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      
      // 🚨 토큰을 로컬 스토리지에 저장 (인증 상태 유지)
      localStorage.setItem('access_token', access_token); 
      
      setMessage('로그인 성공! 토큰이 저장되었습니다.');
      // 로그인 성공 후 페이지를 리디렉션하거나 상태를 업데이트하는 로직을 여기에 추가

    } catch (error) {
      const detail = error.response?.data?.detail || '로그인 요청에 실패했습니다.';
      setMessage(`로그인 실패: ${detail}`);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>🔑 로그인</h2>
      <input
        type="text"
        placeholder="사용자 이름"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <br />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />
      <button type="submit">로그인</button>
      {message && <p style={{ color: message.includes('성공') ? 'green' : 'red' }}>{message}</p>}
    </form>
  );
}

export default LoginForm;