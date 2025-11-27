# 데이터베이스 설정 가이드 (대안 방법)

## "New Query" 버튼이 없는 경우

Supabase 인터페이스가 업데이트되었거나 다른 레이아웃을 사용하는 경우, 다음 방법들을 시도해보세요.

## 방법 1: SQL Editor 직접 사용

1. **Supabase 대시보드** 접속
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. SQL Editor 화면이 열리면:
   - 빈 텍스트 영역이 보이면 그곳에 SQL을 붙여넣기
   - "+" 버튼이나 "New" 버튼이 있으면 클릭
   - 또는 그냥 텍스트 영역에 직접 입력

## 방법 2: Table Editor에서 직접 생성

### exercise_templates 테이블 생성

1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. **New Table** 또는 **Create Table** 버튼 클릭
3. 테이블 이름: `exercise_templates`
4. 다음 컬럼 추가:

| 컬럼명 | 타입 | 설정 |
|--------|------|------|
| id | uuid | Primary Key, Default: `gen_random_uuid()` |
| name | text | Not Null |
| body_part | text | Not Null |
| pain_level | integer | Check: `>= 1 AND <= 5` |
| equipment_types | text[] | Array |
| experience_level | text | Check: `IN ('초보', '중급', '고급')` |
| duration_minutes | integer | Not Null |
| description | text | |
| instructions | text | |
| precautions | text | |
| created_at | timestamptz | Default: `now()` |

5. **Save** 또는 **Create** 클릭

### 다른 테이블들도 동일한 방법으로 생성

필요한 모든 테이블:
- `gyms`
- `gym_facilities`
- `exercise_templates` ⭐
- `user_courses`
- `course_exercises`
- `reviews`
- `gym_crowd_levels`
- `favorites`

## 방법 3: SQL 파일을 직접 복사하여 실행

### 단계별 실행

SQL Editor에서 다음을 순서대로 실행하세요:

#### 1. 기본 테이블 생성

```sql
-- 헬스장/운동공간 정보 테이블
CREATE TABLE IF NOT EXISTS gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  website TEXT,
  operating_hours JSONB,
  price_range TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. exercise_templates 테이블 생성 (가장 중요!)

```sql
-- 재활운동 템플릿 테이블
CREATE TABLE IF NOT EXISTS exercise_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  body_part TEXT NOT NULL,
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 5),
  equipment_types TEXT[],
  experience_level TEXT CHECK (experience_level IN ('초보', '중급', '고급')),
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  instructions TEXT,
  precautions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. RLS 정책 설정

```sql
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise_templates"
  ON exercise_templates FOR SELECT
  USING (true);
```

#### 4. 인덱스 생성

```sql
CREATE INDEX IF NOT EXISTS idx_exercise_templates_body_part 
ON exercise_templates(body_part);
```

## 방법 4: Supabase CLI 사용 (고급)

터미널에서 직접 실행:

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# SQL 파일 실행
supabase db push
```

## 방법 5: API를 통한 실행 (프로그래밍 방식)

PostgreSQL 연결 정보를 사용하여 직접 연결:

1. Supabase 대시보드 → **Settings** → **Database**
2. **Connection string** 복사
3. PostgreSQL 클라이언트(예: pgAdmin, DBeaver)로 연결
4. SQL 파일 실행

## 빠른 해결: 최소한의 테이블만 생성

코스 생성 기능만 작동하게 하려면 최소한 다음만 생성:

```sql
-- exercise_templates 테이블만 생성
CREATE TABLE IF NOT EXISTS exercise_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  body_part TEXT NOT NULL,
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 5),
  equipment_types TEXT[],
  experience_level TEXT CHECK (experience_level IN ('초보', '중급', '고급')),
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  instructions TEXT,
  precautions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise_templates"
  ON exercise_templates FOR SELECT
  USING (true);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_exercise_templates_body_part 
ON exercise_templates(body_part);

-- user_courses 테이블
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  body_part TEXT NOT NULL,
  pain_level INTEGER,
  equipment_types TEXT[],
  experience_level TEXT,
  total_duration INTEGER NOT NULL,
  warmup_duration INTEGER DEFAULT 15,
  main_duration INTEGER DEFAULT 60,
  cooldown_duration INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own courses"
  ON user_courses FOR SELECT
  USING (true);

CREATE POLICY "Users can create own courses"
  ON user_courses FOR INSERT
  WITH CHECK (true);

-- course_exercises 테이블
CREATE TABLE IF NOT EXISTS course_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES user_courses(id) ON DELETE CASCADE,
  exercise_template_id UUID REFERENCES exercise_templates(id),
  exercise_name TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('warmup', 'main', 'cooldown')),
  sets INTEGER,
  reps INTEGER,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE course_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own course_exercises"
  ON course_exercises FOR SELECT
  USING (true);

CREATE POLICY "Users can create own course_exercises"
  ON course_exercises FOR INSERT
  WITH CHECK (true);
```

## 확인 방법

테이블이 생성되었는지 확인:

1. **Table Editor**에서 `exercise_templates` 테이블이 보이는지 확인
2. 또는 SQL Editor에서 다음 쿼리 실행:

```sql
SELECT * FROM exercise_templates LIMIT 1;
```

오류가 없으면 테이블이 정상적으로 생성된 것입니다.

## 문제 해결

### 문제: SQL Editor가 보이지 않음

**해결:**
- 왼쪽 메뉴를 스크롤하여 찾기
- 메뉴 아이콘만 보이면 "SQL Editor" 텍스트를 찾기
- 브라우저를 새로고침

### 문제: SQL 실행 버튼이 없음

**해결:**
- SQL을 입력한 후 `Ctrl + Enter` (Windows) 또는 `Cmd + Enter` (Mac) 누르기
- 또는 SQL Editor 하단의 "Run" 버튼 찾기

### 문제: 권한 오류

**해결:**
- 프로젝트 소유자인지 확인
- 올바른 프로젝트를 선택했는지 확인

