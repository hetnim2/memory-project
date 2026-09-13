"""현재 `.env`의 MySQL DB에 schema_cloud.sql 테이블을 생성합니다."""

from config import BASE_DIR
from database import open_cursor


def load_sql_statements() -> list[str]:
    """단순한 스키마 파일을 세미콜론 단위 SQL 문장으로 나눕니다."""
    schema_text = (BASE_DIR / "schema_cloud.sql").read_text(encoding="utf-8")
    return [statement.strip() for statement in schema_text.split(";") if statement.strip()]


def main() -> None:
    """스키마의 각 SQL을 차례로 실행하고 완료 여부를 출력합니다."""
    statements = load_sql_statements()
    with open_cursor(commit=True) as cursor:
        for index, statement in enumerate(statements, start=1):
            cursor.execute(statement)
            print(f"[{index}/{len(statements)}] SQL 실행 완료")

    print("외부 MySQL 테이블 준비가 끝났습니다.")


if __name__ == "__main__":
    main()
