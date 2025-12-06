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
    like_count: int
    liked: bool   # ⭐ 추가

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

    like_count: int
    dislike_count: int

    class Config:
        from_attributes = True

class CommentVoteResponse(BaseModel):
    comment_id: int
    like_count: int
    dislike_count: int


# ---------------------
# 👍 좋아요 응답 모델
# ---------------------
class PostLikeResponse(BaseModel):
    post_id: int
    liked: bool
    like_count: int


# ---------------------
# ⭐ 즐겨찾기 응답 모델
# ---------------------
class PostFavoriteResponse(BaseModel):
    post_id: int
    favorited: bool

class UserComment(BaseModel):
    id: int
    content: str
    post_id: int
    post_title: str

    class Config:
        from_attributes = True