"""회원가입, 로그인과 로그인 상태 API의 데이터 모양입니다."""

import re
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

USERNAME_PATTERN = re.compile(r"^[\w-]+$", re.UNICODE)


class RegisterRequest(BaseModel):
    """회원가입할 때 브라우저가 보내는 값입니다."""

    username: str = Field(min_length=4, max_length=50)
    password: str = Field(min_length=8, max_length=128)
    nickname: str = Field(min_length=1, max_length=50)

    @field_validator("username", mode="before")
    @classmethod
    def validate_username(cls, value: object) -> str:
        """아이디 앞뒤 공백을 없애고 허용 문자를 확인합니다."""
        if not isinstance(value, str):
            raise ValueError("아이디는 문자열로 입력해 주세요.")
        cleaned = value.strip()
        if not USERNAME_PATTERN.fullmatch(cleaned):
            raise ValueError("아이디는 글자, 숫자, 밑줄, 하이픈만 사용할 수 있습니다.")
        return cleaned

    @field_validator("password", mode="before")
    @classmethod
    def keep_password_spaces(cls, value: object) -> str:
        """실수로 입력한 앞뒤 공백을 비밀번호에 포함하지 않습니다."""
        if not isinstance(value, str):
            raise ValueError("비밀번호는 문자열로 입력해 주세요.")
        cleaned = value.strip()
        if len(cleaned) < 8:
            raise ValueError("비밀번호는 8자 이상 입력해 주세요.")
        return cleaned

    @field_validator("nickname", mode="before")
    @classmethod
    def clean_nickname(cls, value: object) -> str:
        """닉네임 앞뒤 공백을 제거합니다."""
        if not isinstance(value, str):
            raise ValueError("닉네임은 문자열로 입력해 주세요.")
        return value.strip()


class LoginRequest(BaseModel):
    """로그인할 때 브라우저가 보내는 값입니다."""

    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    """비밀번호를 제외하고 브라우저에 보여 줄 회원 정보입니다."""

    id: int
    username: str
    nickname: str
    created_at: datetime


class AuthResponse(BaseModel):
    """회원가입 또는 로그인 성공 응답입니다."""

    message: str
    user: UserResponse


class AuthStateResponse(BaseModel):
    """현재 브라우저가 로그인했는지 알려 주는 응답입니다."""

    authenticated: bool
    user: UserResponse | None = None


class MessageResponse(BaseModel):
    """간단한 성공 안내 문장만 보내는 응답입니다."""

    message: str
