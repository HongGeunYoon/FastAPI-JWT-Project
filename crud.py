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


def get_posts(db: Session, skip: int = 0, limit: int = 10, current_user_id: int | None = None):
    posts = db.query(models.Post).offset(skip).limit(limit).all()

    result = []

    for post in posts:
        # 좋아요 수 계산
        like_count = (
            db.query(models.PostLike)
            .filter(models.PostLike.post_id == post.id)
            .count()
        )

        # 내가 눌렀는지 여부
        is_liked = False
        if current_user_id:
            is_liked = (
                db.query(models.PostLike)
                .filter_by(user_id=current_user_id, post_id=post.id)
                .first()
                is not None
            )

        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "owner_id": post.owner_id,
            "like_count": like_count,
            "liked": is_liked,
        })

    return result


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
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).all()

    result = []
    for c in comments:
        like_count = db.query(models.CommentLike).filter_by(
            comment_id=c.id,
            is_like=True
        ).count()

        dislike_count = db.query(models.CommentLike).filter_by(
            comment_id=c.id,
            is_like=False
        ).count()

        result.append({
            "id": c.id,
            "content": c.content,
            "post_id": c.post_id,
            "owner_id": c.owner_id,
            "like_count": like_count,
            "dislike_count": dislike_count,
        })
    return result



# --------------------------
# 👍 좋아요 토글
# --------------------------
def toggle_like(db: Session, user_id: int, post_id: int):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        return None

    like = db.query(models.PostLike).filter_by(user_id=user_id, post_id=post_id).first()

    if like:
        db.delete(like)
        db.commit()
        liked = False
    else:
        new_like = models.PostLike(user_id=user_id, post_id=post_id)
        db.add(new_like)
        db.commit()
        liked = True

    # ⭐ PostLike 테이블에서 좋아요 수 계산
    like_count = (
        db.query(models.PostLike)
        .filter(models.PostLike.post_id == post_id)
        .count()
    )

    # ⭐ main.py에서 그대로 return되도록 완성된 JSON 형태로 반환
    return {
        "post_id": post_id,
        "liked": liked,
        "like_count": like_count
    }

# --------------------------
# ⭐ 즐겨찾기 토글
# --------------------------
def toggle_favorite(db: Session, user_id: int, post_id: int):
    fav = db.query(models.PostFavorite).filter_by(user_id=user_id, post_id=post_id).first()

    if fav:
        db.delete(fav)
        db.commit()
        return False  # 즐겨찾기 해제
    else:
        new_fav = models.PostFavorite(user_id=user_id, post_id=post_id)
        db.add(new_fav)
        db.commit()
        return True  # 즐겨찾기 추가
    


def toggle_comment_like(db: Session, user_id: int, comment_id: int, is_like: bool):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        return None

    existing = (
        db.query(models.CommentLike)
        .filter_by(user_id=user_id, comment_id=comment_id)
        .first()
    )

    if existing:
        # 같은 상태일 때 → 추천 취소
        if existing.is_like == is_like:
            db.delete(existing)
            db.commit()
        else:
            # 다른 상태일 때 → 추천 → 비추천 전환 or 반대
            existing.is_like = is_like
            db.commit()
    else:
        new_vote = models.CommentLike(
            user_id=user_id,
            comment_id=comment_id,
            is_like=is_like
        )
        db.add(new_vote)
        db.commit()

    # 최신 count 계산
    like_count = (
        db.query(models.CommentLike)
        .filter_by(comment_id=comment_id, is_like=True)
        .count()
    )
    dislike_count = (
        db.query(models.CommentLike)
        .filter_by(comment_id=comment_id, is_like=False)
        .count()
    )

    return {
        "comment_id": comment_id,
        "like_count": like_count,
        "dislike_count": dislike_count
    }



def get_liked_posts_by_user(db: Session, user_id: int):
    """
    사용자가 '좋아요' 누른 게시글 목록 반환
    """
    # 1) 내가 좋아요 누른 레코드들
    likes = db.query(models.PostLike).filter_by(user_id=user_id).all()
    post_ids = [like.post_id for like in likes]

    if not post_ids:
        return []

    # 2) 해당 게시글들
    posts = db.query(models.Post).filter(models.Post.id.in_(post_ids)).all()

    result = []
    for post in posts:
        like_count = (
            db.query(models.PostLike)
            .filter(models.PostLike.post_id == post.id)
            .count()
        )
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "owner_id": post.owner_id,
            "like_count": like_count,
            "liked": True,  # ✅ 내 프로필이니까 당연히 내가 좋아요한 글
        })
    return result


def get_favorited_posts_by_user(db: Session, user_id: int):
    """
    사용자가 즐겨찾기한 게시글 목록 반환
    """
    favs = db.query(models.PostFavorite).filter_by(user_id=user_id).all()
    post_ids = [fav.post_id for fav in favs]

    if not post_ids:
        return []

    posts = db.query(models.Post).filter(models.Post.id.in_(post_ids)).all()

    result = []
    for post in posts:
        like_count = (
            db.query(models.PostLike)
            .filter(models.PostLike.post_id == post.id)
            .count()
        )
        # 여기서는 liked를 굳이 True로 안 해도 되지만, 타입 맞추려고 False로 둠
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "owner_id": post.owner_id,
            "like_count": like_count,
            "liked": False,  # 필요하면 True로 바꿔도 됨
        })
    return result


def get_comments_by_user(db: Session, user_id: int):
    """
    사용자가 작성한 댓글 목록 + 어느 게시글인지의 제목까지 포함
    """
    comments = (
        db.query(models.Comment, models.Post)
        .join(models.Post, models.Comment.post_id == models.Post.id)
        .filter(models.Comment.owner_id == user_id)
        .all()
    )

    result = []
    for comment, post in comments:
        result.append({
            "id": comment.id,
            "content": comment.content,
            "post_id": comment.post_id,
            "post_title": post.title,
        })

    return result
