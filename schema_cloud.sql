-- Aiven 등 외부 MySQL에서 선택한 DB 안에 실행하는 테이블 전용 스키마입니다.
-- CREATE DATABASE와 USE를 뺐기 때문에 관리형 DB의 기본 데이터베이스에도 적용됩니다.

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
