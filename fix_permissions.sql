-- 모든 테이블의 RLS 정책을 초기화하고 누구나 접근 가능하도록 설정합니다.
-- 개발 및 테스트 단계에서 권한 문제를 확실하게 해결하기 위함입니다.

-- 1. exercise_templates (운동 템플릿)
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view exercise_templates" ON exercise_templates;
DROP POLICY IF EXISTS "Anyone can insert exercise_templates" ON exercise_templates;
DROP POLICY IF EXISTS "Public view exercise_templates" ON exercise_templates;
DROP POLICY IF EXISTS "Public insert exercise_templates" ON exercise_templates;

CREATE POLICY "Public view exercise_templates" ON exercise_templates FOR SELECT USING (true);
CREATE POLICY "Public insert exercise_templates" ON exercise_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update exercise_templates" ON exercise_templates FOR UPDATE USING (true);

-- 2. user_courses (사용자 코스)
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own courses" ON user_courses;
DROP POLICY IF EXISTS "Users can create own courses" ON user_courses;
DROP POLICY IF EXISTS "Public view user_courses" ON user_courses;
DROP POLICY IF EXISTS "Public insert user_courses" ON user_courses;

CREATE POLICY "Public view user_courses" ON user_courses FOR SELECT USING (true);
CREATE POLICY "Public insert user_courses" ON user_courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update user_courses" ON user_courses FOR UPDATE USING (true);

-- 3. course_exercises (코스 운동 목록)
ALTER TABLE course_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own course_exercises" ON course_exercises;
DROP POLICY IF EXISTS "Users can create own course_exercises" ON course_exercises;
DROP POLICY IF EXISTS "Public view course_exercises" ON course_exercises;
DROP POLICY IF EXISTS "Public insert course_exercises" ON course_exercises;

CREATE POLICY "Public view course_exercises" ON course_exercises FOR SELECT USING (true);
CREATE POLICY "Public insert course_exercises" ON course_exercises FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update course_exercises" ON course_exercises FOR UPDATE USING (true);

SELECT '모든 권한 설정이 완료되었습니다!' as message;
