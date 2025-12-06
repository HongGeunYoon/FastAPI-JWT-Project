import React, { useState } from 'react';
import api from '../api';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await api.post(
        '/users/',
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      setMessage('회원가입 성공! 로그인해주세요.');
      setUsername('');
      setPassword('');
    } catch (error) {
      // ⭐ FastAPI의 ValidationError(detail 배열)를 사람이 읽을 수 있게 변환
      let detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        // ⭐ password 길이 오류 메시지만 추출
        const msg = detail[0]?.msg;

        if (msg.includes('at least 8 characters')) {
          setMessage('❌ 비밀번호는 8자리 이상이어야 합니다.');
          return;
        }

        // ⭐ 다른 validation 에러도 읽기 쉽게 표시
        setMessage(`❌ ${msg}`);
        return;
      }

      setMessage('❌ 회원가입 실패');
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '30px' }}
    >
      <h2>🆕 회원가입</h2>

      <input
        type="text"
        placeholder="아이디 입력"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      /><br/>

      <input
        type="password"
        placeholder="비밀번호 입력 (8자리 이상)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      /><br/>

      <button type="submit">회원가입</button>

      {message && (
        <p style={{ color: message.includes('성공') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </form>
  );
}

export default SignupForm;
