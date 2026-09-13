"""비밀번호 원문이 남지 않고 올바른 값만 통과하는지 확인합니다."""

from utils.security import hash_password, verify_password


def test_password_hash_round_trip() -> None:
    """올바른 비밀번호만 저장된 해시와 일치해야 합니다."""
    password = "안전한비밀번호123!"
    stored_hash = hash_password(password)

    assert password not in stored_hash
    assert verify_password(password, stored_hash)
    assert not verify_password("틀린비밀번호", stored_hash)


def test_same_password_uses_different_salt() -> None:
    """같은 비밀번호도 회원마다 서로 다른 해시가 만들어져야 합니다."""
    password = "같은비밀번호123!"
    assert hash_password(password) != hash_password(password)
