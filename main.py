from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from schemas import UserCreate, User, Token, PostCreate, Post, Comment, CommentCreate, PostLikeResponse, PostFavoriteResponse
import models
from models import User as UserModel
import crud
from fastapi.security import OAuth2PasswordRequestForm
from auth_token import create_access_token, get_current_user

print(">>> USING MAIN:", __file__)
# DB 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI JWT Auth API!"}


# 사용자 정보 확인
@app.get("/users/me/", response_model=User)
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return current_user


# 회원가입
@app.post("/users/", response_model=User)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)


# 로그인(JWT 발급)
@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# 게시글 생성
@app.post("/posts/", response_model=Post)
def create_post_for_user(
    post: PostCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_user_post(db=db, post=post, user_id=current_user.id)


# 게시글 목록 조회
@app.get("/posts/", response_model=list[Post])
def read_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_posts(db, skip=skip, limit=limit)


# 댓글 생성
@app.post("/posts/{post_id}/comments/", response_model=Comment)
def create_comment_for_post(
    post_id: int,
    comment: CommentCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_post = crud.get_post(db, post_id=post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    return crud.create_comment_for_post(db=db, comment=comment, post_id=post_id, user_id=current_user.id)


# 댓글 목록 조회
@app.get("/posts/{post_id}/comments/", response_model=list[Comment])
def read_comments_for_post(post_id: int, db: Session = Depends(get_db)):
    return crud.get_comments_by_post(db, post_id=post_id)


# -----------------------------
# 👍 좋아요 기능
# -----------------------------
@app.post("/posts/{post_id}/like", response_model=PostLikeResponse)
def like_post(
    post_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_post = crud.get_post(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    liked = crud.toggle_like(db, user_id=current_user.id, post_id=post_id)
    return {"post_id": post_id, "liked": liked}


# -----------------------------
# ⭐ 즐겨찾기 기능
# -----------------------------
@app.post("/posts/{post_id}/favorite", response_model=PostFavoriteResponse)
def favorite_post(
    post_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_post = crud.get_post(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    favorited = crud.toggle_favorite(db, user_id=current_user.id, post_id=post_id)
    return {"post_id": post_id, "favorited": favorited}
