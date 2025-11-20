from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Text, UniqueConstraint
from database import Base
from sqlalchemy.orm import relationship


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(length=255), index=True)
    content = Column(String(length=4000))
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")

    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    favorites = relationship("PostFavorite", back_populates="post", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(length=100), unique=True, index=True)
    hashed_password = Column(String(length=100))
    is_active = Column(Boolean, default=True)

    posts = relationship("Post", back_populates="owner")
    comments = relationship("Comment", back_populates="owner")

    likes = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("PostFavorite", back_populates="user", cascade="all, delete-orphan")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(length=255), index=True)
    description = Column(String(length=500), index=True)
    owner_id = Column(Integer)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)

    post_id = Column(Integer, ForeignKey("posts.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))

    post = relationship("Post", back_populates="comments")
    owner = relationship("User", back_populates="comments")


# -------------------
# 👍 Like 테이블
# -------------------
class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))

    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="_user_post_like_uc"),
    )


# -------------------
# ⭐ Favorite 테이블
# -------------------
class PostFavorite(Base):
    __tablename__ = "post_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))

    user = relationship("User", back_populates="favorites")
    post = relationship("Post", back_populates="favorites")

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="_user_post_fav_uc"),
    )
