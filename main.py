"""FastAPI 앱을 조립하고 웹 서버가 불러오는 시작 파일입니다."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from config import BASE_DIR, get_settings, validate_production_settings
from routers import auth, health, memories, pages

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    """서버 시작 시 배포용 비밀값 누락을 먼저 확인합니다."""
    validate_production_settings(settings)
    yield


app = FastAPI(
    title="한장의 추억 API",
    description="회원 인증과 추억 저장·조회 기능을 제공하는 FastAPI 서버",
    version="1.0.0",
    lifespan=lifespan,
)

# 세션 쿠키에는 사용자 번호만 서명해 저장하고 비밀번호는 넣지 않습니다.
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    session_cookie="memory_book_session",
    max_age=settings.session_max_age_seconds,
    same_site="lax",
    https_only=settings.session_https_only,
)

if settings.allowed_hosts != ("*",):
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=list(settings.allowed_hosts),
    )

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

app.include_router(pages.router)
app.include_router(auth.router)
app.include_router(memories.router)
app.include_router(health.router)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """브라우저의 기본 보안 동작을 강화하는 응답 헤더를 추가합니다."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


@app.exception_handler(HTTPException)
async def http_error_handler(_: Request, exc: HTTPException):
    """FastAPI 오류를 프런트엔드가 읽기 쉬운 `error` 형식으로 보냅니다."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": str(exc.detail)},
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError):
    """입력 형식 오류를 초보 사용자에게 이해하기 쉬운 문장으로 보냅니다."""
    first_error = exc.errors()[0] if exc.errors() else {}
    message = first_error.get("msg", "입력값을 확인해 주세요.")
    return JSONResponse(status_code=422, content={"error": message})
