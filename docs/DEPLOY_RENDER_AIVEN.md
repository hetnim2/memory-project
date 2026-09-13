# Render 웹 서버 + Aiven MySQL 배포

이 문서는 2026-09-12 기준의 초보자용 예시입니다. 가입 직전 각 서비스의 요금·제한을 다시 확인하세요.

- Render 무료 Web Service: <https://render.com/docs/free>
- Render FastAPI 등 Web Service: <https://render.com/docs/web-services>
- Render 환경 변수와 Secret File: <https://render.com/docs/configure-environment-variables>
- Aiven MySQL 무료 구간: <https://aiven.io/docs/products/mysql/concepts/mysql-free-tier>
- Aiven MySQL 시작: <https://aiven.io/docs/products/mysql/get-started>

## 왜 두 서비스가 필요한가

Render는 FastAPI 코드를 실행하고 인터넷 주소를 제공합니다. Aiven은 노트북 대신 MySQL 데이터를 계속 보관합니다. 그래서 집 노트북을 꺼도 두 외부 서비스가 작동하는 동안 사용자가 접속할 수 있습니다.

## 1단계: Aiven MySQL 만들기

1. Aiven에 가입하고 새 서비스를 만듭니다.
2. MySQL과 Free tier를 선택합니다.
3. 서비스가 Running이 되면 `Quick connect`에서 Host, Port, User, Password, Database 값을 확인합니다.
4. CA 인증서도 내려받아 보관합니다.
5. Workbench 또는 DBeaver로 접속해 선택한 Database 안에서 `schema_cloud.sql`을 실행합니다.

무료 MySQL은 현재 1 CPU, RAM 1GB, 디스크 1GB, 최대 연결 76개인 단일 노드 학습·소규모용입니다. 활동이 오래 없으면 꺼질 수 있지만 다시 켤 수 있습니다.

## 2단계: GitHub 저장소 준비

FastAPI 폴더 안의 파일들을 새 GitHub 저장소 루트에 올립니다. 업로드 전에 다음 파일이 포함되지 않았는지 확인합니다.

- `.env`
- `ca.pem` 또는 다른 인증서
- 실제 DB 비밀번호가 적힌 메모
- `.venv`, `__pycache__`

`.gitignore`가 이를 막도록 준비되어 있지만, 첫 업로드 목록을 눈으로 한 번 더 확인하세요.

## 3단계: Render Blueprint 배포

1. Render에서 `New → Blueprint`를 선택합니다.
2. FastAPI GitHub 저장소를 연결합니다.
3. 저장소의 `render.yaml`을 읽으면 무료 Web Service 설정이 나타납니다.
4. 처음 생성할 때 다음 값을 Aiven의 연결 정보로 입력합니다.

```text
MYSQL_HOST
MYSQL_PORT
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DATABASE
```

`SESSION_SECRET`은 `render.yaml`이 새 난수로 자동 생성합니다. `APP_ENV=production`, `SESSION_HTTPS_ONLY=true`도 이미 설정되어 있습니다.

## 4단계: CA 인증서 연결

1. Render 서비스의 `Environment`에서 Secret File을 추가합니다.
2. 파일 이름을 `ca.pem`으로 하고 Aiven CA 인증서 내용을 넣습니다.
3. 환경 변수 `MYSQL_SSL_CA=/etc/secrets/ca.pem`을 추가합니다.
4. 저장하고 다시 배포합니다.

Secret File은 GitHub에 올라가지 않고 실행 중 `/etc/secrets/ca.pem`으로 읽힙니다.

## 5단계: 배포 확인

Render가 준 `https://...onrender.com` 주소에서 차례로 확인합니다.

1. `/health` → `{"status":"ok"}`
2. `/health/database` → DB connected
3. `/docs` → API 문서
4. `/write` → 추억 저장
5. `/` → 회원가입·로그인·이름 검색

## 무료 구간에서 알아둘 제한

Render 무료 웹 서버는 15분 동안 요청이 없으면 잠들고, 다음 첫 접속 때 다시 켜지는 데 약 1분 걸릴 수 있습니다. 월 750시간 한도가 있고 로컬 파일은 재시작 때 사라지므로 데이터는 반드시 외부 MySQL에 저장해야 합니다.

이 프로젝트의 영상은 서버 전송량을 사용합니다. 특히 여러 사용자가 동시에 처음 열면 로딩 시간이 달라질 수 있습니다. 현재 FastAPI 본에서는 66.7MB였던 작성 영상을 약 13.4MB로 줄였습니다.

50명 규모의 발표·지인 사용에는 시작점이 될 수 있지만, “50명이 정확히 같은 순간에 접속해도 무조건 무료·무지연”을 보장하는 구성은 아닙니다. 실제 접속량과 무료 구간 사용량을 대시보드에서 확인하세요.
