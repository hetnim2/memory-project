# Flask에서 FastAPI로 바뀐 점

## 전체 흐름 비교

| 기능 | Flask 원본 | FastAPI 본체 |
|---|---|---|
| 앱 시작 | `app = Flask(...)` | `app = FastAPI(...)` |
| URL 등록 | `@app.get(...)` | 기능별 `APIRouter` |
| JSON 입력 | `request.get_json()` | Pydantic 요청 스키마 |
| 쿼리 입력 | `request.args.get()` | 함수 매개변수 `Query(...)` |
| JSON 출력 | `jsonify(...)` | dict + 응답 스키마 |
| 정적 파일 | 직접 `send_from_directory()` | `/static`에 `StaticFiles` 연결 |
| HTML | 파일 직접 전달 | `Jinja2Templates`로 전달 |
| DB 연결 | 요청마다 직접 연결·종료 | `database.py` 연결 풀과 컨텍스트 관리 |
| 로그인 | JS의 `admin / 1234` 비교 | DB 회원 + PBKDF2 해시 + 서명 세션 쿠키 |
| API 문서 | 별도 작성 필요 | `/docs` 자동 생성 |

## 예시 1: 이름 받기

Flask에서는 요청 객체 안에서 직접 값을 꺼냈습니다.

```python
target_name = request.args.get("name", "").strip()
```

FastAPI에서는 함수 매개변수 자체가 입력 규칙입니다.

```python
def get_memories(
    request: Request,
    name: str = Query(min_length=1, max_length=100),
):
```

이렇게 쓰면 FastAPI가 길이 검사와 API 문서 생성을 함께 처리합니다.

## 예시 2: JSON 저장 요청

Flask는 JSON을 dict로 받은 뒤 직접 각 값을 검사했습니다.

```python
data = request.get_json(silent=True) or {}
target_name = str(data.get("target_name", "")).strip()
```

FastAPI는 `schemas/memory.py`의 `MemoryCreateRequest`가 필수값, 길이와 공백을 검사합니다.

```python
def save_memory(data: MemoryCreateRequest):
    memory_id = create_memory(data)
```

라우터는 HTTP 요청과 응답에 집중하고, 실제 SQL은 `services/memory_service.py`가 맡습니다.

## 예시 3: 로그인

원본 JavaScript는 브라우저에서 보이는 고정 문자열만 비교했습니다. 이는 개발자 도구로 쉽게 우회할 수 있고 실제 사용자별 계정도 만들지 못합니다.

FastAPI 버전은 다음 순서로 처리합니다.

1. `routers/auth.py`가 JSON을 받습니다.
2. `schemas/auth.py`가 아이디·비밀번호 길이를 검사합니다.
3. `services/auth_service.py`가 `users` 행을 조회합니다.
4. `utils/security.py`가 PBKDF2 해시를 비교합니다.
5. 성공하면 서명된 쿠키 세션에 사용자 번호만 저장합니다.

비밀번호 원문은 DB나 쿠키에 저장하지 않습니다.

## 파일을 찾는 기준

- 주소나 GET/POST를 바꾸려면 `routers/`
- SQL과 업무 규칙을 바꾸려면 `services/`
- 입력 글자 수 같은 API 규칙을 바꾸려면 `schemas/`
- DB 주소·포트·연결을 바꾸려면 `.env`, `config.py`, `database.py`
- 화면 위치를 바꾸려면 `static/css/`
- 클릭·페이지 이동을 바꾸려면 `static/js/`
- HTML 요소를 바꾸려면 `templates/`

이 기준으로 나눴기 때문에 `main.py`를 길게 아래로 내리며 모든 기능을 찾을 필요가 없습니다.
