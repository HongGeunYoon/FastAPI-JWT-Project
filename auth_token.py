from datetime import datetime, timedelta
from typing import Optional

# JWT 생성을 위한 라이브러리 임포트
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from schemas import TokenData # schemas.py에서 정의한 TokenData 임포트
from database import get_db
from crud import get_user_by_username
from models import User as UserModel

# -----------------
# 💡 JWT 설정 값 (보안에 매우 중요)
# -----------------
# 환경 변수나 설정 파일을 사용하는 것이 좋으나, 지금은 코드를 명시합니다.
SECRET_KEY = "당신의_매우_매우_매우_안전한_비밀키" # 실제 서비스에서는 절대로 노출되지 않게 하세요!
ALGORITHM = "HS256" # 사용할 암호화 알고리즘
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # 토큰 만료 시간 (분 단위)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    # 토큰에 포함될 데이터 복사
    to_encode = data.copy()
    
    # 1. 만료 시간 설정
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # 기본 만료 시간 (30분)
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 2. 만료 시간 (exp)을 토큰 페이로드에 추가
    to_encode.update({"exp": expire})
    
    # 3. JWT 인코딩 및 반환
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. JWT 토큰 디코딩
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 2. 페이로드에서 사용자 이름(sub) 추출 (main.py에서 {"sub": user.username}으로 저장했음)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
        # 3. 토큰 데이터 스키마 검증
        token_data = TokenData(username=username)
    
    except JWTError:
        # JWT 디코딩 실패 (토큰 만료, 잘못된 시크릿 키 등)
        raise credentials_exception
    
    # 4. DB에서 사용자 정보 조회
    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
        
    return user