-- 동네 재활 헬스장 & 운동 코스 추천 서비스 스키마

-- 헬스장/운동공간 정보 테이블
CREATE TABLE IF NOT EXISTS gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  website TEXT,
  operating_hours JSONB, -- {"weekday": "06:00-23:00", "weekend": "08:00-22:00"}
  price_range TEXT, -- "저렴함", "보통", "비쌈"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 헬스장 시설 정보 테이블
CREATE TABLE IF NOT EXISTS gym_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  has_shower BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  has_rehab_equipment BOOLEAN DEFAULT false, -- 재활기구 보유
  has_pt_coach BOOLEAN DEFAULT false, -- PT/재활코치 여부
  is_quiet BOOLEAN DEFAULT false, -- 조용한 분위기
  equipment_types TEXT[], -- ["덤벨", "머신", "매트", "밴드", "짐볼"]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gym_id)
);

-- 태그 기반 리뷰 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_id TEXT, -- 로그인 없을 경우 anonymous_id, 로그인 시 user_id
  tags TEXT[] NOT NULL, -- ["조용함", "재활친화", "장비 깨끗함", "복잡함"]
  comment TEXT, -- 선택적 코멘트 (최대 200자)
  is_admin_review BOOLEAN DEFAULT false, -- 운영자 seed 리뷰 여부
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 혼잡도 정보 테이블 (시간대별 예상 혼잡도)
CREATE TABLE IF NOT EXISTS gym_crowd_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=일요일, 6=토요일
  time_slot TEXT NOT NULL, -- "06:00-09:00", "09:00-12:00", "12:00-18:00", "18:00-22:00", "22:00-24:00"
  expected_level TEXT NOT NULL CHECK (expected_level IN ('한산', '보통', '붐빔')), -- 예상 혼잡도
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gym_id, day_of_week, time_slot)
);

-- 재활운동 템플릿 테이블
CREATE TABLE IF NOT EXISTS exercise_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  body_part TEXT NOT NULL, -- "허리", "어깨", "무릎", "목", "전신"
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 5), -- 통증 레벨 (1-5)
  equipment_types TEXT[], -- 필요한 기구 ["덤벨", "머신", "매트", "밴드", "짐볼"]
  experience_level TEXT CHECK (experience_level IN ('초보', '중급', '고급')), -- 운동 경험 수준
  duration_minutes INTEGER NOT NULL, -- 운동 시간 (분)
  description TEXT,
  instructions TEXT, -- 운동 방법 설명
  precautions TEXT, -- 주의사항
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자가 생성한 재활 코스 테이블
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- 로그인 없을 경우 anonymous_id
  body_part TEXT NOT NULL,
  pain_level INTEGER,
  equipment_types TEXT[],
  experience_level TEXT,
  total_duration INTEGER NOT NULL, -- 총 시간 (분)
  warmup_duration INTEGER DEFAULT 15, -- 준비운동 시간
  main_duration INTEGER DEFAULT 60, -- 메인 운동 시간
  cooldown_duration INTEGER DEFAULT 15, -- 마무리 시간
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 코스에 포함된 운동 목록 테이블
CREATE TABLE IF NOT EXISTS course_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES user_courses(id) ON DELETE CASCADE,
  exercise_template_id UUID REFERENCES exercise_templates(id),
  exercise_name TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('warmup', 'main', 'cooldown')), -- 준비/메인/마무리
  sets INTEGER,
  reps INTEGER,
  duration_seconds INTEGER, -- 운동 시간 (초)
  rest_seconds INTEGER, -- 휴식 시간 (초)
  order_index INTEGER NOT NULL, -- 순서
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 즐겨찾기 테이블
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- anonymous_id or user_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gym_id, user_id)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_crowd_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 조회 가능
CREATE POLICY "Anyone can view gyms"
  ON gyms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view gym_facilities"
  ON gym_facilities FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Anyone can view gym_crowd_levels"
  ON gym_crowd_levels FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view exercise_templates"
  ON exercise_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can view own courses"
  ON user_courses FOR SELECT
  USING (true);

CREATE POLICY "Users can create own courses"
  ON user_courses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own course_exercises"
  ON course_exercises FOR SELECT
  USING (true);

CREATE POLICY "Users can create own course_exercises"
  ON course_exercises FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view favorites"
  ON favorites FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_gyms_latitude ON gyms(latitude);
CREATE INDEX IF NOT EXISTS idx_gyms_longitude ON gyms(longitude);
CREATE INDEX IF NOT EXISTS idx_gyms_active ON gyms(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gym_facilities_gym_id ON gym_facilities(gym_id);
CREATE INDEX IF NOT EXISTS idx_reviews_gym_id ON reviews(gym_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_templates_body_part ON exercise_templates(body_part);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_course_exercises_course_id ON course_exercises(course_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- 위치 기반 검색을 위한 함수 (PostGIS 없이 기본 함수 사용)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  -- Haversine 공식을 사용한 거리 계산 (km 단위)
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) *
      cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_facilities_updated_at BEFORE UPDATE ON gym_facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_crowd_levels_updated_at BEFORE UPDATE ON gym_crowd_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
