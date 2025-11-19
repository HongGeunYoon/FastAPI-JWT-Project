// 1. LoginForm 컴포넌트를 임포트합니다.
import React, { useState } from 'react';
import LoginForm from './components/LoginForm'
import UserInfo from './components/UserInfo';
import PostList from './components/PostList';
import PostForm from './components/PostForm';

import './App.css' 



function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <div className="App" style={{ margin: '50px' }}>
      {/* 4. 기존의 Vite/React 로고 및 카운터 관련 JSX 제거 */}
      <h1>FastAPI & React JWT 인증 테스트</h1>
      
      {/* 5. 🚨 LoginForm 컴포넌트를 추가합니다. */}
      <LoginForm />
      {/* 2. 🚨 로그인된 사용자 정보 표시 컴포넌트 추가 */}
      <UserInfo />
      <PostForm onPostCreated={handlePostCreated} />

      <PostList key={refreshKey} />
      
    </div>
  );
}

export default App