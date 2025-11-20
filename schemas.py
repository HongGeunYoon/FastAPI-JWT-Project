from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


# 1. 사용자 생성 요청 시 사용 (ID, PW 포함)
class UserCreate(BaseModel):
    username: str
    password: str = Field(min_length=8, max_length=72)


# 2. 사용자 응답 시 사용
class User(BaseModel):
    id: int
    username: str
    is_active: bool

    class Config:
        from_attributes = True


class ItemCreate(BaseModel):
    title: str
    description: str | None = None


class Item(BaseModel):
    id: int
    title: str
    description: str | None = None
    owner_id: int

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


# 게시글
class PostCreate(BaseModel):
    title: str
    content: str


class Post(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int

    model_config = ConfigDict(from_attributes=True)


# 댓글
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


# ---------------------
# 👍 좋아요 응답 모델
# ---------------------
class PostLikeResponse(BaseModel):
    post_id: int
    liked: bool


# ---------------------
# ⭐ 즐겨찾기 응답 모델
# ---------------------
class PostFavoriteResponse(BaseModel):
    post_id: int
    favorited: bool
