# MySQL 연결과 기존 데이터 활용

## 집 노트북 DB

처음이면 `schema.sql` 전체를 실행합니다. 이 파일은 `memory_book` DB와 `users`, `memories` 두 테이블을 만듭니다.

학교에서 쓰던 `memory_book.memories`가 이미 집 MySQL에 복사되어 있다면 기존 테이블은 건드리지 말고 `migrations/001_create_users.sql`만 한 번 실행하세요.

## 기존 추억 데이터가 안 보이는 가장 흔한 이유

학교 MySQL과 집 MySQL은 서로 다른 서버입니다. 학교에서 입력한 데이터는 학교 DB에 있고, 집에서 `127.0.0.1`로 연결하면 집 DB를 보므로 자동으로 나타나지 않습니다.

기존 데이터를 옮기려면 학교에서 `memories`를 SQL 또는 CSV로 내보내고 집 또는 외부 MySQL에 가져와야 합니다. 구조는 원본과 같아서 컬럼 변환은 필요 없습니다.

## 외부 관리형 MySQL

외부 DB 서비스가 이미 데이터베이스 하나를 제공하면 그 DB를 선택한 상태에서 `schema_cloud.sql`을 실행합니다. 또는 `.env`를 채운 뒤 다음 명령을 사용할 수 있습니다.

```powershell
python -m scripts.init_cloud_db
```

외부 서비스가 CA 인증서를 제공하면 프로젝트에 커밋하지 말고 안전한 별도 위치에 두고 `MYSQL_SSL_CA`에 그 경로를 적습니다. 이 앱은 CA 인증서와 DB 호스트 이름을 함께 확인합니다.

## 연결 풀을 쓰는 이유

요청마다 TCP 연결을 처음부터 만드는 비용을 줄이기 위해 `database.py`가 기본 5개 연결을 재사용합니다. 50명 안팎의 작은 프로젝트 시작점으로 충분하며, DB 서비스 제한에 따라 `MYSQL_POOL_SIZE`를 조절할 수 있습니다.

## 확인 SQL

```sql
USE memory_book;

SHOW TABLES;

SELECT id, username, nickname, created_at
FROM users
ORDER BY id DESC;

SELECT id, target_name, memory_content, created_at
FROM memories
ORDER BY id DESC;
```

`password_hash`는 로그인 검사용 값이므로 화면에 표시하거나 다른 사람에게 보내지 마세요.
