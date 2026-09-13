"""배포 서버와 DB가 살아 있는지 확인하는 상태 점검 API입니다."""

from fastapi import APIRouter, HTTPException
from mysql.connector import Error as MySQLError

from database import DatabaseConfigurationError, check_database_connection

router = APIRouter(tags=["상태 확인"])


@router.get("/health")
def health_check():
    """웹 서버 자체가 요청에 응답하는지 확인합니다."""
    return {"status": "ok"}


@router.get("/health/database")
def database_health_check():
    """MySQL 연결과 간단한 쿼리 실행 여부를 확인합니다."""
    try:
        if check_database_connection():
            return {"status": "ok", "database": "connected"}
    except (MySQLError, DatabaseConfigurationError, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail="데이터베이스에 연결할 수 없습니다.",
        ) from exc

    raise HTTPException(status_code=503, detail="데이터베이스 응답이 올바르지 않습니다.")
