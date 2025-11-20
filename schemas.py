from pydantic import BaseModel,Field,ConfigDict
from typing import Optional

# 1. 사용자 생성 요청 시 사용 (ID, PW 포함)
class UserCreate(BaseModel):
    username: str
    password: str = Field(min_length=8, max_length=72)

# 2. 사용자 응답 시 사용 (ID, PW 제외)
class User(BaseModel):
    id: int
    username: str
    is_active: bool

    class Config:
        # ORM 모드를 활성화하여 SQLAlchemy 모델 객체를 Pydantic 모델로 변환 가능하게 함
        from_attributes = True
        #orm_mode = True 
        # Pydantic v2에서는 'from_attributes = True'를 사용합니다.

# Item 생성 요청 시 사용
class ItemCreate(BaseModel):
    title: str
    description: str | None = None

# Item 응답 시 사용
class Item(BaseModel):
    id: int
    title: str
    description: str | None = None
    owner_id: int

    class Config:
        orm_mode = True
        
class Token(BaseModel):
    # 액세스 토큰 문자열
    access_token: str
    # 토큰 타입 (보통 "bearer"입니다)
    token_type: str
    
class TokenData(BaseModel):
    # JWT에 담긴 사용자 이름 (선택적)
    username: str | None = None
    
# 게시글 생성 요청 시 사용
class PostCreate(BaseModel):
    title: str
    content: str

# 게시글 응답 시 사용
class Post(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int
    
    # Pydantic V2 설정
    model_config = ConfigDict(from_attributes=True)
    
class CommentBase(BaseModel):
    content: str = Field(..., max_length=500)

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    post_id: int
    owner_id: int 

    class Config:
        from_attributes = True