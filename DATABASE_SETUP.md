# 데이터베이스 설정 가이드

## 문제: "Could not find the table 'public.exercise_templates' in the schema cache"

이 오류는 Supabase 데이터베이스에 필요한 테이블들이 생성되지 않았을 때 발생합니다.

## 해결 방법

### 1단계: Supabase 대시보드 접속

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택

### 2단계: SQL Editor 열기

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New Query** 버튼 클릭

### 3단계: 스키마 실행

1. 프로젝트의 `lib/db/schema.sql` 파일을 열기
2. 파일의 **전체 내용**을 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. 성공 메시지 확인

**중요:** 
- 스키마 파일의 전체 내용을 한 번에 실행해야 합니다
- 일부만 실행하면 외래 키 제약 조건 오류가 발생할 수 있습니다

### 4단계: 초기 데이터 추가 (선택사항)

운동 템플릿 데이터를 추가하려면:

1. SQL Editor에서 **New Query** 클릭
2. `lib/db/seed.sql` 파일의 전체 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭
4. 성공 메시지 확인

### 5단계: 테이블 확인

생성된 테이블을 확인하려면:

1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. 다음 테이블들이 보이는지 확인:
   - `gyms`
   - `gym_facilities`
   - `exercise_templates` ⭐ (이 테이블이 없으면 오류 발생)
   - `user_courses`
   - `course_exercises`
   - `reviews`
   - `gym_crowd_levels`
   - `favorites`

### 6단계: RLS 정책 확인

Row Level Security (RLS) 정책이 올바르게 설정되었는지 확인:

1. **Table Editor**에서 `exercise_templates` 테이블 선택
2. **Policies** 탭 클릭
3. "Anyone can view exercise_templates" 정책이 있는지 확인

## 문제 해결

### 문제: SQL 실행 중 오류 발생

**해결 방법:**
- 스키마 파일을 처음부터 끝까지 순서대로 실행했는지 확인
- 이전에 부분적으로 실행했다면 테이블을 삭제하고 다시 실행
- 오류 메시지를 확인하고 해당 부분 수정

### 문제: 테이블은 있지만 데이터가 없음

**해결 방법:**
- `lib/db/seed.sql` 파일을 실행하여 초기 데이터 추가
- 또는 Table Editor에서 직접 데이터 추가

### 문제: RLS 정책 오류

**해결 방법:**
- SQL Editor에서 다음 쿼리 실행:
```sql
CREATE POLICY "Anyone can view exercise_templates"
  ON exercise_templates FOR SELECT
  USING (true);
```

## 빠른 확인 방법

브라우저에서 다음 URL로 접속하여 연결 상태 확인:
```
http://localhost:3000/api/health
```

성공하면 데이터베이스 연결이 정상입니다. 하지만 테이블이 없으면 여전히 오류가 발생할 수 있습니다.

## 추가 도움말

- 자세한 Supabase 설정은 `SUPABASE_SETUP.md` 참조
- 환경 변수 설정은 `CHECK_ENV.md` 참조

