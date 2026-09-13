-- 집 MySQL에서 처음 한 번 실행하는 전체 스키마입니다.
CREATE DATABASE IF NOT EXISTS memory_book
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

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

-- 원본 memories 컬럼을 그대로 유지하므로 기존 데이터도 계속 사용할 수 있습니다.
CREATE TABLE IF NOT EXISTS memories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '번호',
    target_name VARCHAR(100) NOT NULL COMMENT '대상 이름',
    memory_content TEXT NOT NULL COMMENT '추억 내용',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록 시간',
    PRIMARY KEY (id),
    INDEX idx_memories_target_created (target_name, created_at, id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
