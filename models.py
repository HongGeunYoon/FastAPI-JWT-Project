from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Text
from database import Base 
from sqlalchemy.orm import relationship

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    # 🚨 수정: title에 길이 추가
    title = Column(String(length=255), index=True) 
    # 🚨 수정: content에 길이 추가 (VARCHAR)
    content = Column(String(length=4000)) 
    
    owner_id = Column(Integer, ForeignKey("users.id")) 
    owner = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # 🚨 수정: username에 길이 추가
    username = Column(String(length=100), unique=True, index=True) 
    # 🚨 수정: hashed_password에 길이 추가 (해시된 문자열을 저장할 공간)
    hashed_password = Column(String(length=100)) 
    is_active = Column(Boolean, default=True)
    posts = relationship("Post", back_populates="owner")
    comments = relationship("Comment", back_populates="owner")
    
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    # 🚨 수정: title에 길이 추가
    title = Column(String(length=255), index=True)
    # 🚨 수정: description에 길이 추가
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