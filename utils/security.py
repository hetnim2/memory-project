"""비밀번호를 안전한 단방향 해시로 저장하고 확인합니다."""

import base64
import hashlib
import hmac
import secrets

ALGORITHM = "pbkdf2_sha256"
ITERATIONS = 600_000
SALT_BYTES = 16


def hash_password(password: str) -> str:
    """임의의 salt와 PBKDF2를 사용해 DB 저장용 문자열을 만듭니다."""
    salt = secrets.token_bytes(SALT_BYTES)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        ITERATIONS,
    )

    salt_text = base64.urlsafe_b64encode(salt).decode("ascii")
    hash_text = base64.urlsafe_b64encode(password_hash).decode("ascii")
    return f"{ALGORITHM}${ITERATIONS}${salt_text}${hash_text}"


def verify_password(password: str, stored_hash: str) -> bool:
    """입력 비밀번호를 같은 방식으로 계산해 저장된 해시와 비교합니다."""
    try:
        algorithm, iterations_text, salt_text, expected_text = stored_hash.split("$", 3)
        if algorithm != ALGORITHM:
            return False

        salt = base64.urlsafe_b64decode(salt_text.encode("ascii"))
        expected_hash = base64.urlsafe_b64decode(expected_text.encode("ascii"))
        candidate_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            int(iterations_text),
        )
        return hmac.compare_digest(candidate_hash, expected_hash)
    except (ValueError, TypeError, UnicodeError):
        # 형식이 손상된 DB 값이 있어도 서버 전체가 멈추지 않게 합니다.
        return False
