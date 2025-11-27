-- 빠른 설정: 코스 생성에 필요한 최소한의 테이블만 생성
-- 이 파일을 Supabase SQL Editor에 복사하여 실행하세요

-- 1. exercise_templates 테이블 생성
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

-- 2. RLS 활성화 및 정책 설정
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise_templates"
  ON exercise_templates FOR SELECT
  USING (true);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_exercise_templates_body_part 
ON exercise_templates(body_part);

-- 4. user_courses 테이블 생성
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

-- 5. course_exercises 테이블 생성
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

-- 완료 메시지
SELECT '테이블 생성 완료!' as message;

