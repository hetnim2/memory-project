"""이름 검색과 익명 추억 저장 API 주소를 정의합니다."""

from fastapi import APIRouter, HTTPException, Query, status
from mysql.connector import Error as MySQLError

from database import DatabaseConfigurationError
from schemas.memory import (
    MemoryCreatedResponse,
    MemoryCreateRequest,
    MemoryListResponse,
)
from services.memory_service import create_memory, find_memories_by_name

router = APIRouter(prefix="/api/memories", tags=["추억"])


@router.get("", response_model=MemoryListResponse)
@router.get("/", response_model=MemoryListResponse, include_in_schema=False)
def get_memories(
    name: str = Query(min_length=1, max_length=100),
):
    """로그인 여부와 관계없이 같은 이름의 추억을 최신순으로 조회합니다."""
    target_name = name.strip()
    if not target_name:
        raise HTTPException(status_code=400, detail="대상 이름을 입력해 주세요.")

    try:
        memories = find_memories_by_name(target_name)
    except (MySQLError, DatabaseConfigurationError, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail="추억 조회 중 데이터베이스 연결을 확인해 주세요.",
        ) from exc

    return {"memories": memories, "count": len(memories)}


@router.post(
    "",
    response_model=MemoryCreatedResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/",
    response_model=MemoryCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def save_memory(data: MemoryCreateRequest):
    """누구나 링크에서 이름과 추억을 익명으로 저장할 수 있게 합니다."""
    try:
        memory_id = create_memory(data)
    except (MySQLError, DatabaseConfigurationError, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail="추억 저장 중 데이터베이스 연결을 확인해 주세요.",
        ) from exc

    return {"message": "추억이 익명으로 등록되었습니다.", "id": memory_id}
