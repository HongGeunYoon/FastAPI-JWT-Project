from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. 💡 드라이버 변경: mysqlclient 설치에 맞춰 URL을 'mysql+mysqldb'로 변경했습니다.
# 형식: "mysql+mysqldb://<사용자_이름>:<비밀번호>@<호스트_주소>/<데이터베이스_이름>"
# 🚨 'root:password' 부분을 사용자의 실제 비밀번호로 반드시 변경해야 합니다!
SQLALCHEMY_DATABASE_URL = "mysql+mysqldb://root:dbs1242!@localhost/fastapidb"

# MySQL 엔진 생성
# 2. 🚨 문법 오류 수정: 함수 안에 대입문(등호 '=')을 넣지 않고, 정의된 변수만 전달합니다.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# DB 세션을 얻는 Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()