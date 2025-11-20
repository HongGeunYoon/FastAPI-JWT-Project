// src/components/UserInfo.jsx

import React, { useState, useEffect } from 'react';
import api from '../api'; // 🚨 JWT 토큰이 자동으로 추가되는 API 인스턴스

function UserInfo() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      // 1. 토큰이 없으면 요청하지 않습니다.
      if (!localStorage.getItem('access_token')) {
        setError('로그인이 필요합니다.');
        return;
      }
      
      try {
        // 2. 🚨 GET /users/me/ 호출
        // (api.js에서 토큰을 자동으로 헤더에 넣어줍니다.)
        const response = await api.get('/users/me/');
        
        // 3. 성공 시 사용자 정보 저장
        setUser(response.data);
        setError(null);

      } catch (err) {
        // 4. 실패 (토큰 만료, 잘못된 토큰 등) 시 오류 메시지 표시
        console.error('사용자 정보 로드 실패:', err);
        setError('사용자 정보를 불러올 수 없습니다. (토큰 오류 또는 만료)');
        setUser(null);
        // 필요하다면 localStorage.removeItem('access_token'); 로 토큰을 지울 수도 있습니다.
      }
    };

    fetchUserInfo();
  }, []);

  if (error) {
    return <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>;
  }

  if (!user) {
    return <p style={{ marginTop: '10px' }}>사용자 정보를 로드 중...</p>;
  }

  // 사용자 정보 표시 (FastAPI 스키마: id, username, is_active 등)
  return (
    <div style={{ padding: '10px', border: '1px solid green', marginTop: '20px' }}>
      <h3>👨‍💻 로그인된 사용자 정보</h3>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>사용자 이름:</strong> {user.username}</p>
      <p><strong>활성화 상태:</strong> {user.is_active ? '활성' : '비활성'}</p>
    </div>
  );
}

export default UserInfo;