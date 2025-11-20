# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from schemas import UserCreate, User,Token,PostCreate, Post, Comment, CommentCreate
import models
from models import User as UserModel
import crud
from fastapi.security import OAuth2PasswordRequestForm # 핵심! 로그인 폼 처리용
from auth_token import create_access_token,get_current_user # JWT 토큰 생성 함수 임포트

# Base.metadata.create_all(bind=engine)를 호출하여 DB 파일 및 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "*",  # 개발 단계에서 모든 도메인 허용
    # 실제 환경에서는 프론트엔드 주소를 명시해야 합니다. 예: "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 루트(Root) 경로 테스트 엔드포인트
@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI JWT Auth API!"}

@app.get("/users/me/", response_model=User) # schemas.User 스키마 사용
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    # get_current_user 디펜던시가 토큰을 검증하고 인증된 사용자 객체를 반환합니다.
    # 인증에 실패하면 FastAPI가 자동으로 401 UNAUTHORIZED 응답을 반환합니다.
    return current_user

# 새로운 사용자 생성 (회원가입) 엔드포인트
@app.post("/users/", response_model=User) # schemas.User 사용
def create_new_user(user: UserCreate, db: Session = Depends(get_db)): # schemas.UserCreate 사용
    # 1. 사용자 이름 중복 확인
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=Token) # schemas.Token 사용
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # 1. 사용자 인증 시도 (crud.py의 함수 사용)
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    
    # 2. 인증 실패 시 401 Unauthorized 반환
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username} # 토큰에 포함될 데이터 (subject: 사용자 이름)
    )
    
    # 4. 토큰 응답 반환 (schemas.Token 형식)
    return {"access_token": access_token, "token_type": "bearer"}

# 게시글 생성 엔드포인트 (로그인 필수!)
@app.post("/posts/", response_model=Post)
def create_post_for_user(
    post: PostCreate,
    current_user: UserModel = Depends(get_current_user), # JWT 인증 필수
    db: Session = Depends(get_db)
):
    # current_user.id를 사용하여 해당 사용자의 ID로 게시글을 생성
    return crud.create_user_post(db=db, post=post, user_id=current_user.id)

# 모든 게시글 조회 엔드포인트 (선택적: 인증 없이도 조회 가능하게 설정)
@app.get("/posts/", response_model=list[Post])
def read_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    posts = crud.get_posts(db, skip=skip, limit=limit)
    return posts

# 1. 댓글 생성 (로그인 필수!)
@app.post("/posts/{post_id}/comments/", response_model=Comment, status_code=status.HTTP_201_CREATED)
def create_comment_for_post(
    post_id: int,
    comment: CommentCreate,
    current_user: UserModel = Depends(get_current_user), # JWT 인증 필수
    db: Session = Depends(get_db)
):
    # 게시글 존재 여부 확인
    db_post = crud.get_post(db, post_id=post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    # 로그인한 사용자 ID와 게시글 ID를 사용하여 댓글 생성
    return crud.create_comment_for_post(db=db, comment=comment, post_id=post_id, user_id=current_user.id)

# 2. 특정 게시글의 댓글 목록 조회 (공개 경로)
@app.get("/posts/{post_id}/comments/", response_model=list[Comment])
def read_comments_for_post(post_id: int, db: Session = Depends(get_db)):
    return crud.get_comments_by_post(db, post_id=post_id)