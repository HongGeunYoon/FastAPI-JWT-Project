from passlib.context import CryptContext

# Bcrypt 해싱 알고리즘 사용 설정
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# 비밀번호 해싱 함수
def get_password_hash(password):
    return pwd_context.hash(password)

# 비밀번호 검증 함수 (로그인 시 사용 예정)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)