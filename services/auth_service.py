"""회원 저장, 비밀번호 확인과 회원 조회의 실제 로직입니다."""

from mysql.connector import IntegrityError

from database import open_cursor
from schemas.auth import LoginRequest, RegisterRequest
from utils.security import hash_password, verify_password


class UsernameAlreadyExistsError(ValueError):
    """이미 사용 중인 아이디로 가입하려 할 때 발생합니다."""


def _public_user(row: dict) -> dict:
    """DB 행에서 비밀번호 해시를 빼고 공개 가능한 필드만 고릅니다."""
    return {
        "id": row["id"],
        "username": row["username"],
        "nickname": row["nickname"],
        "created_at": row["created_at"],
    }


def register_user(data: RegisterRequest) -> dict:
    """중복 아이디를 확인한 뒤 비밀번호 해시와 회원 정보를 저장합니다."""
    try:
        with open_cursor(dictionary=True, commit=True) as cursor:
            cursor.execute(
                "SELECT id FROM users WHERE username = %s LIMIT 1",
                (data.username,),
            )
            if cursor.fetchone():
                raise UsernameAlreadyExistsError("이미 사용 중인 아이디입니다.")

            cursor.execute(
                """
                INSERT INTO users (username, password_hash, nickname)
                VALUES (%s, %s, %s)
                """,
                (data.username, hash_password(data.password), data.nickname),
            )
            user_id = cursor.lastrowid

            cursor.execute(
                """
                SELECT id, username, nickname, created_at
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )
            return _public_user(cursor.fetchone())
    except IntegrityError as exc:
        # 동시에 같은 아이디가 들어오는 경우에도 UNIQUE 제약을 사용자 안내로 바꿉니다.
        raise UsernameAlreadyExistsError("이미 사용 중인 아이디입니다.") from exc


def authenticate_user(data: LoginRequest) -> dict | None:
    """아이디를 찾고 비밀번호가 맞으면 회원 정보를 반환합니다."""
    with open_cursor(dictionary=True) as cursor:
        cursor.execute(
            """
            SELECT id, username, password_hash, nickname, created_at
            FROM users
            WHERE username = %s
            LIMIT 1
            """,
            (data.username.strip(),),
        )
        user = cursor.fetchone()

    password_matches = user and verify_password(
        data.password.strip(),
        user["password_hash"],
    )
    if not password_matches:
        return None

    with open_cursor(commit=True) as cursor:
        cursor.execute(
            "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = %s",
            (user["id"],),
        )

    return _public_user(user)


def get_user_by_id(user_id: int) -> dict | None:
    """세션에 저장된 회원 번호로 현재 회원을 조회합니다."""
    with open_cursor(dictionary=True) as cursor:
        cursor.execute(
            """
            SELECT id, username, nickname, created_at
            FROM users
            WHERE id = %s
            LIMIT 1
            """,
            (user_id,),
        )
        user = cursor.fetchone()

    return _public_user(user) if user else None
