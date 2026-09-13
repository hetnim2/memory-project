"""`.env`와 서버 환경 변수를 읽어 한곳에서 설정을 관리합니다."""

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _as_bool(value: str, *, default: bool = False) -> bool:
    """문자열 환경 변수를 True/False 값으로 바꿉니다."""
    if not value:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _as_int(value: str, *, default: int) -> int:
    """빈 문자열도 안전하게 정수 기본값으로 바꿉니다."""
    return int(value.strip()) if value and value.strip() else default


@dataclass(frozen=True)
class Settings:
    """애플리케이션과 MySQL에 필요한 설정 모음입니다."""

    app_env: str
    app_host: str
    app_port: int
    allowed_hosts: tuple[str, ...]

    session_secret: str
    session_https_only: bool
    session_max_age_seconds: int

    mysql_host: str
    mysql_port: int
    mysql_user: str
    mysql_password: str
    mysql_database: str
    mysql_pool_size: int
    mysql_connect_timeout: int
    mysql_ssl_ca: str

    @property
    def is_production(self) -> bool:
        """인터넷 배포 환경인지 알려 줍니다."""
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """환경 변수를 읽고, 같은 실행 중에는 그 값을 재사용합니다."""
    allowed_hosts_text = os.getenv("ALLOWED_HOSTS", "*")
    allowed_hosts = tuple(
        host.strip() for host in allowed_hosts_text.split(",") if host.strip()
    ) or ("*",)

    return Settings(
        app_env=os.getenv("APP_ENV", "development").strip().lower(),
        app_host=os.getenv("APP_HOST", "0.0.0.0").strip(),
        app_port=_as_int(os.getenv("PORT", os.getenv("APP_PORT", "8000")), default=8000),
        allowed_hosts=allowed_hosts,
        session_secret=os.getenv(
            "SESSION_SECRET",
            "change-this-local-development-secret",
        ),
        session_https_only=_as_bool(
            os.getenv("SESSION_HTTPS_ONLY", "false"),
            default=False,
        ),
        session_max_age_seconds=_as_int(
            os.getenv("SESSION_MAX_AGE_SECONDS", "28800"),
            default=28800,
        ),
        mysql_host=os.getenv("MYSQL_HOST", "").strip(),
        mysql_port=_as_int(os.getenv("MYSQL_PORT", "3306"), default=3306),
        mysql_user=os.getenv("MYSQL_USER", "").strip(),
        mysql_password=os.getenv("MYSQL_PASSWORD", ""),
        mysql_database=os.getenv("MYSQL_DATABASE", "").strip(),
        mysql_pool_size=_as_int(os.getenv("MYSQL_POOL_SIZE", "5"), default=5),
        mysql_connect_timeout=_as_int(
            os.getenv("MYSQL_CONNECT_TIMEOUT", "10"),
            default=10,
        ),
        mysql_ssl_ca=os.getenv("MYSQL_SSL_CA", "").strip(),
    )


def validate_production_settings(settings: Settings) -> None:
    """배포 환경에서 비밀값 누락이나 약한 기본값 사용을 막습니다."""
    if not settings.is_production:
        return

    missing_database_values = [
        name
        for name, value in {
            "MYSQL_HOST": settings.mysql_host,
            "MYSQL_USER": settings.mysql_user,
            "MYSQL_PASSWORD": settings.mysql_password,
            "MYSQL_DATABASE": settings.mysql_database,
        }.items()
        if not value
    ]
    if missing_database_values:
        missing_text = ", ".join(missing_database_values)
        raise RuntimeError(f"배포용 DB 환경 변수가 비어 있습니다: {missing_text}")

    if (
        settings.session_secret == "change-this-local-development-secret"
        or len(settings.session_secret) < 32
    ):
        raise RuntimeError("배포 환경에서는 32자 이상의 새 SESSION_SECRET이 필요합니다.")
