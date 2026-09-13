"""MySQL 연결 풀과 안전한 커서 사용을 담당합니다."""

from contextlib import contextmanager
from pathlib import Path
from threading import Lock
from typing import Iterator

from mysql.connector.pooling import MySQLConnectionPool

from config import BASE_DIR, get_settings


class DatabaseConfigurationError(RuntimeError):
    """DB 접속 정보가 비어 있거나 잘못됐을 때 사용하는 오류입니다."""


_pool: MySQLConnectionPool | None = None
_pool_lock = Lock()


def _connection_config() -> dict:
    """환경 설정을 mysql-connector가 이해하는 형식으로 바꿉니다."""
    settings = get_settings()
    required = {
        "MYSQL_HOST": settings.mysql_host,
        "MYSQL_USER": settings.mysql_user,
        "MYSQL_PASSWORD": settings.mysql_password,
        "MYSQL_DATABASE": settings.mysql_database,
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        raise DatabaseConfigurationError(".env의 MySQL 설정이 비어 있습니다: " + ", ".join(missing))

    config = {
        "host": settings.mysql_host,
        "port": settings.mysql_port,
        "user": settings.mysql_user,
        "password": settings.mysql_password,
        "database": settings.mysql_database,
        "charset": "utf8mb4",
        "use_unicode": True,
        "connection_timeout": settings.mysql_connect_timeout,
        "autocommit": False,
    }

    if settings.mysql_ssl_ca:
        certificate_path = Path(settings.mysql_ssl_ca)
        if not certificate_path.is_absolute():
            certificate_path = BASE_DIR / certificate_path
        if not certificate_path.is_file():
            raise DatabaseConfigurationError(
                f"MYSQL_SSL_CA 인증서 파일을 찾을 수 없습니다: {certificate_path}"
            )

        # 외부 관리형 MySQL은 CA 인증서와 호스트 이름까지 확인합니다.
        config.update(
            ssl_ca=str(certificate_path),
            ssl_verify_cert=True,
            ssl_verify_identity=True,
        )

    return config


def _get_pool() -> MySQLConnectionPool:
    """첫 DB 요청 때만 연결 풀을 만들고 이후에는 재사용합니다."""
    global _pool

    if _pool is None:
        with _pool_lock:
            if _pool is None:
                settings = get_settings()
                _pool = MySQLConnectionPool(
                    pool_name="memory_book_pool",
                    pool_size=settings.mysql_pool_size,
                    pool_reset_session=True,
                    **_connection_config(),
                )
    return _pool


def get_db_connection():
    """연결 풀에서 사용할 MySQL 연결 하나를 빌립니다."""
    return _get_pool().get_connection()


@contextmanager
def open_cursor(*, dictionary: bool = False, commit: bool = False) -> Iterator:
    """SQL 실행 후 commit/rollback과 연결 반환을 자동 처리합니다."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=dictionary)

    try:
        yield cursor
        if commit:
            connection.commit()
    except Exception:
        if commit and connection.is_connected():
            connection.rollback()
        raise
    finally:
        cursor.close()
        if connection.is_connected():
            connection.close()


def check_database_connection() -> bool:
    """상태 확인용으로 DB가 `SELECT 1`에 응답하는지 검사합니다."""
    with open_cursor() as cursor:
        cursor.execute("SELECT 1")
        return cursor.fetchone()[0] == 1
