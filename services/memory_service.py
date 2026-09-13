"""추억 저장과 이름 검색에 필요한 SQL 처리 로직입니다."""

from database import open_cursor
from schemas.memory import MemoryCreateRequest

MAX_MEMORY_RESULTS = 80


def find_memories_by_name(target_name: str) -> list[dict]:
    """같은 이름의 추억을 최신순으로 최대 80개 가져옵니다."""
    with open_cursor(dictionary=True) as cursor:
        # %s 매개변수를 사용해 검색어가 SQL 문장으로 실행되지 않게 합니다.
        cursor.execute(
            """
            SELECT id, target_name, memory_content, created_at
            FROM memories
            WHERE target_name = %s
            ORDER BY created_at DESC, id DESC
            LIMIT %s
            """,
            (target_name, MAX_MEMORY_RESULTS),
        )
        return cursor.fetchall()


def create_memory(data: MemoryCreateRequest) -> int:
    """익명 추억을 저장하고 새로 만들어진 번호를 반환합니다."""
    with open_cursor(commit=True) as cursor:
        cursor.execute(
            """
            INSERT INTO memories (target_name, memory_content)
            VALUES (%s, %s)
            """,
            (data.target_name, data.memory_content),
        )
        return cursor.lastrowid
