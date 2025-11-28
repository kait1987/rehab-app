# 데이터베이스 스키마

이 디렉토리에는 Supabase 데이터베이스 스키마와 마이그레이션 파일이 포함되어 있습니다.

## 파일 설명

- `schema.sql`: 전체 데이터베이스 스키마 정의 및 RLS 정책
- `seed.sql`: 개발/테스트용 초기 데이터

## Supabase에 적용하는 방법

1. Supabase 대시보드에 로그인
2. SQL Editor로 이동
3. `schema.sql` 파일의 내용을 복사하여 실행
4. (선택) `seed.sql` 파일의 내용을 실행하여 초기 데이터 추가

## 주요 테이블

- `gyms`: 헬스장/운동공간 정보
- `gym_facilities`: 헬스장 시설 정보
- `reviews`: 태그 기반 리뷰
- `gym_crowd_levels`: 혼잡도 정보 (시간대별)
- `exercise_templates`: 재활운동 템플릿
- `user_courses`: 사용자가 생성한 재활 코스
- `course_exercises`: 코스에 포함된 운동 목록
- `favorites`: 즐겨찾기

## RLS (Row Level Security)

모든 테이블에 RLS가 활성화되어 있으며, 대부분의 데이터는 모든 사용자가 조회 가능하도록 설정되어 있습니다.
리뷰 작성 및 즐겨찾기는 사용자별로 관리됩니다.

## 거리 계산

`calculate_distance` 함수를 사용하여 두 좌표 간의 거리를 계산할 수 있습니다 (Haversine 공식 사용).
