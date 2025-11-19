// src/api.js

import axios from 'axios';

// 🚨 FastAPI 서버의 주소와 포트를 지정합니다.
const API_BASE_URL = 'http://127.0.0.1:8000'; 

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🚨 JWT 토큰을 요청 헤더에 자동으로 추가하는 인터셉터 설정
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;