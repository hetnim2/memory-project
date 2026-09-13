# API 공부 안내

서버 실행 후 <http://127.0.0.1:8000/docs>를 열면 브라우저에서 각 API를 펼치고 `Try it out`으로 직접 실행할 수 있습니다.

## 회원가입 — POST `/api/auth/register`

보내는 JSON:

```json
{
  "username": "memory_user",
  "password": "8자이상비밀번호",
  "nickname": "추억지기"
}
```

성공하면 HTTP 201과 함께 회원 정보가 오고, 같은 브라우저는 바로 로그인 상태가 됩니다.

## 로그인 — POST `/api/auth/login`

```json
{
  "username": "memory_user",
  "password": "8자이상비밀번호"
}
```

성공하면 서버가 서명된 세션 쿠키를 설정합니다. JavaScript는 비밀번호를 저장하지 않습니다.

## 로그인 상태 — GET `/api/auth/me`

로그인하지 않았을 때:

```json
{
  "authenticated": false,
  "user": null
}
```

## 추억 검색 — GET `/api/memories?name=홍길동`

로그인 세션 없이 사용할 수 있습니다. 같은 이름을 정확히 비교하고 최신순으로 최대 80개를 돌려줍니다.

```json
{
  "memories": [
    {
      "id": 1,
      "target_name": "홍길동",
      "memory_content": "함께 공부해서 즐거웠어요.",
      "created_at": "2026-09-12T10:00:00"
    }
  ],
  "count": 1
}
```

## 추억 저장 — POST `/api/memories`

로그인 없이도 사용할 수 있어 다른 사람에게 `/write` 링크를 보낼 수 있습니다.

```json
{
  "target_name": "홍길동",
  "memory_content": "함께 공부해서 즐거웠어요."
}
```

## 주요 HTTP 상태 코드

| 코드 | 의미 |
|---|---|
| 200 | 조회 또는 로그인이 성공함 |
| 201 | 회원 또는 추억이 새로 저장됨 |
| 400 | 빈 이름 등 잘못된 요청 |
| 401 | 로그인이 필요하거나 비밀번호가 틀림 |
| 409 | 이미 같은 아이디가 있음 |
| 422 | 글자 수나 입력 형식이 규칙과 다름 |
| 503 | MySQL 설정 또는 연결에 문제가 있음 |
