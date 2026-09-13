"""DB 없이도 확인할 수 있는 화면, 상태와 API 흐름 테스트입니다."""

from datetime import datetime

from fastapi.testclient import TestClient

from main import app


def test_public_pages_and_health() -> None:
    """선택·검색·작성 화면과 서버 상태 주소가 정상 응답하는지 확인합니다."""
    with TestClient(app) as client:
        assert client.get("/health").json() == {"status": "ok"}
        choice_response = client.get("/")
        assert "추억 검색하러 가기" in choice_response.text
        assert "추억 기록하러 가기" in choice_response.text
        assert "/static/assets/choice/as1.mp4?v=20260913-2" in choice_response.text
        assert "/static/assets/choice/as2.mp4?v=20260913-2" in choice_response.text
        assert "/static/assets/choice/choice-foreground.png?v=20260913-2" in choice_response.text
        assert choice_response.text.count("loop") == 2
        search_response = client.get("/search")
        assert "한장의 추억" in search_response.text
        assert 'id="memoryBack"' not in search_response.text
        assert "익명으로 추억 남기기" in client.get("/write").text


def test_logged_out_session_state() -> None:
    """세션이 없는 브라우저는 로그아웃 상태로 응답해야 합니다."""
    with TestClient(app) as client:
        response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json() == {"authenticated": False, "user": None}


def test_memory_search_is_public(monkeypatch) -> None:
    """로그인하지 않은 브라우저도 이름으로 추억을 바로 조회합니다."""
    memory = {
        "id": 11,
        "target_name": "홍길동",
        "memory_content": "함께 공부해서 즐거웠어요.",
        "created_at": datetime(2026, 9, 12, 11, 0, 0),
    }
    monkeypatch.setattr("routers.memories.find_memories_by_name", lambda _: [memory])

    with TestClient(app) as client:
        response = client.get("/api/memories", params={"name": "홍길동"})

    assert response.status_code == 200
    assert response.json()["count"] == 1
    assert response.json()["memories"][0]["memory_content"] == "함께 공부해서 즐거웠어요."


def test_register_session_and_memory_api_flow(monkeypatch) -> None:
    """가짜 DB 결과로 회원가입→세션→조회·저장 흐름을 끝까지 확인합니다."""
    user = {
        "id": 7,
        "username": "memory_user",
        "nickname": "추억지기",
        "created_at": datetime(2026, 9, 12, 10, 0, 0),
    }
    memory = {
        "id": 11,
        "target_name": "홍길동",
        "memory_content": "함께 공부해서 즐거웠어요.",
        "created_at": datetime(2026, 9, 12, 11, 0, 0),
    }

    monkeypatch.setattr("routers.auth.register_user", lambda _: user)
    monkeypatch.setattr("routers.auth.get_user_by_id", lambda _: user)
    monkeypatch.setattr("routers.memories.find_memories_by_name", lambda _: [memory])
    monkeypatch.setattr("routers.memories.create_memory", lambda _: 12)

    with TestClient(app) as client:
        register_response = client.post(
            "/api/auth/register",
            json={
                "username": "memory_user",
                "password": "안전한비밀번호123!",
                "nickname": "추억지기",
            },
        )
        assert register_response.status_code == 201

        session_response = client.get("/api/auth/me")
        assert session_response.json()["authenticated"] is True

        search_response = client.get(
            "/api/memories",
            params={"name": "홍길동"},
        )
        assert search_response.status_code == 200
        assert search_response.json()["count"] == 1

        create_response = client.post(
            "/api/memories",
            json={
                "target_name": "홍길동",
                "memory_content": "새 추억",
            },
        )
        assert create_response.status_code == 201
        assert create_response.json()["id"] == 12
