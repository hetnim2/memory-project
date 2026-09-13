-- 기존 memory_book DB에는 이 파일만 한 번 실행해 users 테이블을 추가할 수 있습니다.
USE memory_book;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '회원 번호',
    username VARCHAR(50) NOT NULL COMMENT '로그인 아이디',
    password_hash VARCHAR(255) NOT NULL COMMENT 'PBKDF2 비밀번호 해시',
    nickname VARCHAR(50) NOT NULL COMMENT '화면 표시 이름',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입 시간',
    last_login_at TIMESTAMP NULL DEFAULT NULL COMMENT '마지막 로그인',
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
