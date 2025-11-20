from sqlalchemy.orm import Session
from schemas import UserCreate, PostCreate, CommentCreate
from auth_utils import get_password_hash, verify_password
import models


# 1. 사용자 이름으로 사용자 찾기
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


# 2. 회원가입
def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# 로그인 인증
def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username=username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# 게시글 작성
def create_user_post(db: Session, post: PostCreate, user_id: int):
    db_post = models.Post(**post.model_dump(), owner_id=user_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()


def get_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Post).offset(skip).limit(limit).all()


# 댓글 생성
def create_comment_for_post(db: Session, comment: CommentCreate, post_id: int, user_id: int):
    db_comment = models.Comment(
        content=comment.content,
        post_id=post_id,
        owner_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def get_comments_by_post(db: Session, post_id: int):
    return db.query(models.Comment).filter(models.Comment.post_id == post_id).all()


# --------------------------
# 👍 좋아요 토글
# --------------------------
def toggle_like(db: Session, user_id: int, post_id: int):
    like = db.query(models.PostLike).filter_by(user_id=user_id, post_id=post_id).first()

    if like:  # 이미 좋아요 → 취소
        db.delete(like)
        db.commit()
        return False
    else:  # 좋아요 추가
        new_like = models.PostLike(user_id=user_id, post_id=post_id)
        db.add(new_like)
        db.commit()
        return True

