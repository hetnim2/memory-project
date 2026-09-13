"""회원가입, 로그인, 로그아웃과 현재 로그인 상태 API입니다."""

from fastapi import APIRouter, HTTPException, Request, status
from mysql.connector import Error as MySQLError

from database import DatabaseConfigurationError
from schemas.auth import (
    AuthResponse,
    AuthStateResponse,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
)
from services.auth_service import (
    UsernameAlreadyExistsError,
    authenticate_user,
    get_user_by_id,
    register_user,
)

router = APIRouter(prefix="/api/auth", tags=["회원 인증"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: RegisterRequest, request: Request):
    """새 회원을 만들고 바로 로그인 세션을 시작합니다."""
    try:
        user = register_user(data)
    except UsernameAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (MySQLError, DatabaseConfigurationError, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail="회원가입 중 데이터베이스 연결을 확인해 주세요.",
        ) from exc

    request.session.clear()
    request.session["user_id"] = user["id"]
    return {"message": "회원가입과 로그인이 완료되었습니다.", "user": user}


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, request: Request):
    """아이디와 비밀번호를 확인하고 로그인 세션을 저장합니다."""
    try:
        user = authenticate_user(data)
    except (MySQLError, DatabaseConfigurationError, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail="로그인 중 데이터베이스 연결을 확인해 주세요.",
        ) from exc

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 맞지 않습니다.",
        )

    request.session.clear()
    request.session["user_id"] = user["id"]
    return {"message": "로그인되었습니다.", "user": user}


@router.post("/logout", response_model=MessageResponse)
def logout(request: Request):
    """현재 브라우저의 로그인 세션을 지웁니다."""
    request.session.clear()
    return {"message": "로그아웃되었습니다."}


@router.get("/me", response_model=AuthStateResponse)
def current_user(request: Request):
    """새로고침 뒤에도 로그인 상태를 확인할 수 있게 합니다."""
    user_id = request.session.get("user_id")
    if not user_id:
        return {"authenticated": False, "user": None}

    try:
        user = get_user_by_id(int(user_id))
    except (MySQLError, DatabaseConfigurationError, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail="로그인 상태 확인 중 데이터베이스 연결을 확인해 주세요.",
        ) from exc

    if user is None:
        request.session.clear()
        return {"authenticated": False, "user": None}

    return {"authenticated": True, "user": user}
