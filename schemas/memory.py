"""추억 저장과 조회 API가 주고받는 데이터 모양입니다."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class MemoryCreateRequest(BaseModel):
    """익명 추억 저장 요청입니다."""

    target_name: str = Field(min_length=1, max_length=100)
    memory_content: str = Field(min_length=1, max_length=100)

    @field_validator("target_name", "memory_content", mode="before")
    @classmethod
    def strip_text(cls, value: object) -> str:
        """공백만 입력된 값을 빈 값으로 처리합니다."""
        if not isinstance(value, str):
            raise ValueError("이름과 추억은 문자열로 입력해 주세요.")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("빈 내용은 저장할 수 없습니다.")
        return cleaned


class MemoryResponse(BaseModel):
    """DB에서 조회해 브라우저에 보내는 추억 한 건입니다."""

    id: int
    target_name: str
    memory_content: str
    created_at: datetime


class MemoryListResponse(BaseModel):
    """이름 검색 결과와 전체 개수입니다."""

    memories: list[MemoryResponse]
    count: int


class MemoryCreatedResponse(BaseModel):
    """추억 저장 성공 결과입니다."""

    message: str
    id: int
