"""기존 HTML 화면을 FastAPI 템플릿으로 전달합니다."""

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from config import BASE_DIR

router = APIRouter(tags=["화면"])
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@router.get("/", response_class=HTMLResponse, include_in_schema=False)
def choice_page(request: Request):
    """추억 검색과 기록 중에서 먼저 선택하는 시작 화면입니다."""
    return templates.TemplateResponse(request=request, name="choice.html")


@router.get("/search", response_class=HTMLResponse, include_in_schema=False)
def index_page(request: Request):
    """로그인과 추억 검색·보기 화면을 표시합니다."""
    return templates.TemplateResponse(request=request, name="index.html")


@router.get("/write", response_class=HTMLResponse, include_in_schema=False)
def write_page(request: Request):
    """익명 추억 작성 화면을 표시합니다."""
    return templates.TemplateResponse(request=request, name="write.html")
