from sqlalchemy.orm import Session
from schemas import UserCreate , PostCreate, CommentCreate
from auth_utils import get_password_hash,verify_password
import models


# 1. 사용자 이름으로 사용자 찾기
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

# 2. 새로운 사용자 생성 (회원가입)
def create_user(db: Session, user: UserCreate):
    # 비밀번호 해싱
    hashed_password = get_password_hash(user.password)
    
    # DB 모델 인스턴스 생성
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    
    # DB에 추가 및 커밋
    db.add(db_user)
    db.commit()
    db.refresh(db_user) # DB에서 생성된 ID를 포함한 객체를 다시 로드
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    # 1. 사용자 이름으로 사용자 레코드 조회
    user = get_user_by_username(db, username=username)
    
    # 2. 사용자가 없으면 None 반환
    if not user:
        return None
    
    # 3. 비밀번호 검증 (auth_utils.py의 함수 사용)
    # plain_password(사용자가 입력한 비밀번호)와 hashed_password(DB에 저장된 비밀번호) 비교
    if not verify_password(password, user.hashed_password):
        return None  # 비밀번호가 일치하지 않으면 None 반환
    
    # 4. 인증 성공 시 사용자 객체 반환
    return user

# 게시글 생성 함수
def create_user_post(db: Session, post: PostCreate, user_id: int):
    # Post 모델에 owner_id와 함께 데이터 저장
    db_post = models.Post(**post.model_dump(), owner_id=user_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_post(db: Session, post_id: int):
    # Post 모델을 사용하여 ID가 일치하는 첫 번째 레코드를 반환합니다.
    return db.query(models.Post).filter(models.Post.id == post_id).first()

# 모든 게시글 조회 함수 (간단하게)
def get_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Post).offset(skip).limit(limit).all()

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