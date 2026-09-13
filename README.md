# 한장의 추억 — FastAPI 실제 개발·배포본

학교 Flask 프로젝트의 HTML/CSS/JavaScript와 화면 배치를 최대한 유지하면서, 실제 회원 인증·MySQL API·인터넷 배포가 가능하도록 백엔드를 FastAPI 중심으로 다시 구성한 본체입니다.

## 이 버전에서 되는 일

- 회원가입: 아이디, 비밀번호, 닉네임을 MySQL `users` 테이블에 저장
- 로그인: PBKDF2 해시로 비밀번호를 확인하고 서명된 세션 쿠키 발급
- 로그아웃 및 새로고침 뒤 로그인 상태 확인
- 로그인 없이 메인 화면에서 이름으로 추억 검색
- 첫 화면에서 추억 검색과 추억 기록을 직관적으로 선택
- PC에서는 마우스 위치에 따라 선택한 쪽 영상 하나만 미리 재생
- `/write` 링크에서는 기존처럼 누구나 익명 추억 작성
- 이름별 최신 추억 최대 80개를 8개씩 10페이지 표시
- PC·노트북·태블릿·모바일에서 16:9 본화면 전체가 함께 확대·축소
- 16:9 밖의 여백은 같은 장면의 흐린 배경으로 채워 검은 좌우 공백 방지
- 모바일 세로는 본화면 전체를 작게, 가로는 화면을 꽉 채우도록 표시
- Swagger API 학습 화면 `/docs`
- 집 MySQL과 외부 관리형 MySQL 모두 사용 가능
- Render 등에서 노트북이 꺼져 있어도 공개 주소로 실행 가능

## 폴더를 한눈에 보기

```text
학교프로젝트_FastAPI_배포본/
├─ main.py                  # FastAPI 앱 시작점과 공통 보안 설정
├─ config.py                # `.env` 값을 읽고 검사
├─ database.py              # MySQL 연결 풀, commit/rollback/종료
├─ routers/                 # URL과 GET/POST 같은 HTTP 방식
│  ├─ pages.py              # `/`, `/search`, `/write` HTML 화면
│  ├─ auth.py               # 회원가입·로그인·로그아웃·상태 확인
│  ├─ memories.py           # 추억 저장·이름 검색
│  └─ health.py             # 서버·DB 상태 확인
├─ services/                # 라우터가 호출하는 실제 DB 처리 로직
│  ├─ auth_service.py
│  └─ memory_service.py
├─ schemas/                 # API 입력·출력 데이터 규칙
│  ├─ auth.py
│  └─ memory.py
├─ utils/security.py        # 비밀번호 해시 생성·검사
├─ templates/               # FastAPI가 보여 주는 HTML
├─ static/
│  ├─ css/                  # 화면 스타일
│  ├─ js/                   # 기능별 JavaScript
│  └─ assets/               # 기존 이미지와 최적화된 영상
├─ schema.sql               # 집 MySQL용 DB + 테이블 전체 생성
├─ schema_cloud.sql         # 외부 MySQL용 테이블 생성
├─ migrations/              # 기존 DB에 users만 추가할 때 사용
├─ Dockerfile               # Docker 배포 설정
├─ render.yaml              # Render 배포 설정
├─ .env.example             # 비밀값이 없는 환경 변수 견본
├─ requirements.txt         # 실행 패키지
├─ requirements-dev.txt     # 테스트·코드 검사 패키지
├─ tests/                   # 자동 검사 코드
└─ docs/                    # API, 변환, DB, 배포 학습 문서
```

`main.py`는 여러 기능을 조립만 합니다. URL을 찾고 싶으면 `routers`, SQL 처리를 찾고 싶으면 `services`, DB 연결을 찾고 싶으면 `database.py`, 입력 데이터 규칙을 찾고 싶으면 `schemas`를 보면 됩니다.

## Windows 집 노트북에서 처음 실행

### 1. VS Code 터미널 열기

VS Code에서 이 폴더를 연 뒤 `터미널 → 새 터미널`을 선택합니다.

### 2. 가상환경과 패키지 준비

PowerShell에서 한 줄씩 실행합니다.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

가상환경 실행이 차단되면 현재 터미널에서만 다음 명령을 먼저 실행합니다.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 3. 세션 비밀키 만들기

다음 명령의 출력값을 복사해 `.env`의 `SESSION_SECRET=` 뒤에 붙입니다.

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. MySQL 준비

처음 만드는 DB라면 MySQL Workbench 또는 DBeaver에서 `schema.sql` 전체를 실행합니다. 학교에서 쓰던 `memory_book.memories`가 이미 있다면 `migrations/001_create_users.sql`만 실행하면 됩니다.

그다음 `.env`를 집 MySQL 정보에 맞게 고칩니다.

```dotenv
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=집에서_사용하는_MySQL_아이디
MYSQL_PASSWORD=집에서_사용하는_MySQL_비밀번호
MYSQL_DATABASE=memory_book
```

### 5. 서버 실행

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- 시작 선택: <http://127.0.0.1:8000/>
- 이름 검색: <http://127.0.0.1:8000/search>
- 익명 작성: <http://127.0.0.1:8000/write>
- API 연습 화면: <http://127.0.0.1:8000/docs>
- 서버 확인: <http://127.0.0.1:8000/health>
- DB 확인: <http://127.0.0.1:8000/health/database>

종료할 때는 터미널에서 `Ctrl + C`를 누릅니다.

## 화면 사용 순서

1. 첫 화면에서 `추억 검색하러 가기` 또는 `추억 기록하러 가기`를 선택합니다.
2. 검색 화면에서 대상 이름을 입력하고 Enter 또는 화살표를 누릅니다.
3. 로그인 화면을 거치지 않고 해당 이름의 추억 화면이 열립니다.
4. 추억은 1페이지부터 8개씩 표시됩니다.
5. 회원가입·로그인은 검색 화면 왼쪽 아래 영역에서 별도로 사용할 수 있습니다.
6. 기록 화면에서는 이름과 100자 이내의 추억을 저장할 수 있습니다.

## API 역할

| 방식 | 주소 | 역할 | 로그인 |
|---|---|---|---|
| GET | `/` | 검색·기록 선택 화면 | 불필요 |
| GET | `/search` | 이름 검색·메모리 HTML 화면 | 불필요 |
| GET | `/write` | 익명 작성 HTML 화면 | 불필요 |
| POST | `/api/auth/register` | 회원가입 후 바로 로그인 | 불필요 |
| POST | `/api/auth/login` | 비밀번호 확인 후 세션 생성 | 불필요 |
| POST | `/api/auth/logout` | 현재 세션 삭제 | 불필요 |
| GET | `/api/auth/me` | 현재 로그인 상태 확인 | 불필요 |
| GET | `/api/memories?name=이름` | 같은 이름의 추억 최대 80개 조회 | 불필요 |
| POST | `/api/memories` | 익명 추억 한 건 저장 | 불필요 |
| GET | `/health` | 웹 서버 상태 | 불필요 |
| GET | `/health/database` | MySQL 연결 상태 | 불필요 |

GET은 주로 데이터를 읽고, POST는 회원가입·로그인·저장처럼 서버 상태를 바꿀 때 사용합니다. 자세한 요청 JSON 예시는 `docs/API_GUIDE.md`에 있습니다.

## DB 구조

### `users`

| 컬럼 | 의미 |
|---|---|
| `id` | 자동 증가 회원 번호 |
| `username` | 중복할 수 없는 로그인 아이디 |
| `password_hash` | 원문이 아닌 PBKDF2 해시 |
| `nickname` | 화면에 표시할 이름 |
| `created_at` | 가입 시간 |
| `last_login_at` | 마지막 로그인 시간 |

### `memories`

| 컬럼 | 의미 |
|---|---|
| `id` | 자동 증가 추억 번호 |
| `target_name` | 추억을 남길 대상 이름 |
| `memory_content` | 100자 이내 추억 내용 |
| `created_at` | 저장 시간 |

원본 `memories` 구조를 그대로 유지했기 때문에 기존 데이터를 옮기지 않고 같은 DB에 연결할 수 있습니다.

## 배포 전 꼭 확인

- GitHub에 `.env`, 인증서, 비밀번호를 올리지 않습니다.
- `APP_ENV=production`으로 설정합니다.
- `SESSION_SECRET`은 32자 이상의 새 난수로 설정합니다.
- HTTPS 주소에서는 `SESSION_HTTPS_ONLY=true`로 설정합니다.
- 관리형 MySQL이 CA 파일을 주면 `MYSQL_SSL_CA`를 설정합니다.
- 배포 뒤 `/health`와 `/health/database`를 모두 확인합니다.

Render + Aiven 예시는 `docs/DEPLOY_RENDER_AIVEN.md`에 단계별로 적었습니다. 요금제는 바뀔 수 있으므로 가입 화면의 최신 조건도 함께 확인하세요.

## 코드 검사

```powershell
ruff check .
pytest
```

## 원본과 비교하며 공부하기

- `docs/FLASK_TO_FASTAPI_GUIDE.md`: Flask에서 FastAPI로 무엇이 바뀌었는지
- `docs/API_GUIDE.md`: GET/POST와 각 API 입력·출력
- `docs/DATABASE_GUIDE.md`: 집 DB, 외부 DB, 기존 데이터 활용
- `docs/ORIGINAL_AUDIT.md`: 원본 ZIP 구조·민감정보 점검 결과
- Flask 보존본의 `docs/original_source/`: 변환 전 실제 코드
