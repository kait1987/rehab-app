-- 초기 데이터 시드 (강남/홍대 지역 헬스장 예시)

-- 강남 지역 헬스장 샘플 데이터
INSERT INTO gyms (id, name, address, latitude, longitude, phone, price_range, description, operating_hours) VALUES
  ('00000000-0000-0000-0000-000000000001', '강남 재활 헬스장', '서울특별시 강남구 테헤란로 123', 37.4979, 127.0276, '02-1234-5678', '보통', '조용하고 재활운동에 적합한 헬스장입니다.', '{"weekday": "06:00-23:00", "weekend": "08:00-22:00"}'),
  ('00000000-0000-0000-0000-000000000002', '강남역 필라테스 & 헬스', '서울특별시 강남구 강남대로 456', 37.4980, 127.0280, '02-2345-6789', '비쌈', '필라테스와 재활운동 전문 시설', '{"weekday": "07:00-22:00", "weekend": "09:00-21:00"}'),
  ('00000000-0000-0000-0000-000000000003', '역삼동 조용한 헬스', '서울특별시 강남구 역삼로 789', 37.5000, 127.0300, '02-3456-7890', '저렴함', '소규모 조용한 헬스장', '{"weekday": "06:00-24:00", "weekend": "08:00-22:00"}')
ON CONFLICT (id) DO NOTHING;

-- 홍대 지역 헬스장 샘플 데이터
INSERT INTO gyms (id, name, address, latitude, longitude, phone, price_range, description, operating_hours) VALUES
  ('00000000-0000-0000-0000-000000000004', '홍대입구 재활센터', '서울특별시 마포구 홍익로 123', 37.5563, 126.9236, '02-4567-8901', '보통', '재활운동 전문 센터', '{"weekday": "07:00-23:00", "weekend": "09:00-22:00"}'),
  ('00000000-0000-0000-0000-000000000005', '홍대 조용한 헬스장', '서울특별시 마포구 와우산로 456', 37.5570, 126.9240, '02-5678-9012', '저렴함', '학생들에게 인기 있는 조용한 헬스장', '{"weekday": "06:00-24:00", "weekend": "08:00-22:00"}')
ON CONFLICT (id) DO NOTHING;

-- 헬스장 시설 정보
INSERT INTO gym_facilities (gym_id, has_shower, has_parking, has_rehab_equipment, has_pt_coach, is_quiet, equipment_types) VALUES
  ('00000000-0000-0000-0000-000000000001', true, true, true, true, true, ARRAY['덤벨', '머신', '매트', '밴드', '짐볼']),
  ('00000000-0000-0000-0000-000000000002', true, false, true, true, true, ARRAY['매트', '밴드', '짐볼']),
  ('00000000-0000-0000-0000-000000000003', false, false, false, false, true, ARRAY['덤벨', '머신']),
  ('00000000-0000-0000-0000-000000000004', true, true, true, true, false, ARRAY['덤벨', '머신', '매트', '밴드']),
  ('00000000-0000-0000-0000-000000000005', true, false, false, false, true, ARRAY['덤벨', '머신', '매트'])
ON CONFLICT (gym_id) DO NOTHING;

-- 혼잡도 정보 (예시)
INSERT INTO gym_crowd_levels (gym_id, day_of_week, time_slot, expected_level) VALUES
  ('00000000-0000-0000-0000-000000000001', 1, '06:00-09:00', '보통'),
  ('00000000-0000-0000-0000-000000000001', 1, '09:00-12:00', '한산'),
  ('00000000-0000-0000-0000-000000000001', 1, '12:00-18:00', '보통'),
  ('00000000-0000-0000-0000-000000000001', 1, '18:00-22:00', '붐빔'),
  ('00000000-0000-0000-0000-000000000001', 1, '22:00-24:00', '한산')
ON CONFLICT (gym_id, day_of_week, time_slot) DO NOTHING;

-- 재활운동 템플릿 (허리)
INSERT INTO exercise_templates (id, name, body_part, pain_level, equipment_types, experience_level, duration_minutes, description, instructions, precautions) VALUES
  ('10000000-0000-0000-0000-000000000001', '고양이 자세', '허리', 1, ARRAY['매트'], '초보', 5, '허리 스트레칭 기본 동작', '네 발로 엎드린 자세에서 등을 둥글게 만드는 동작을 반복합니다.', '목에 무리가 가지 않도록 주의하세요.'),
  ('10000000-0000-0000-0000-000000000002', '무릎 가슴 당기기', '허리', 2, ARRAY['매트'], '초보', 5, '허리 통증 완화 스트레칭', '누운 자세에서 무릎을 가슴 쪽으로 천천히 당깁니다.', '통증이 심하면 중단하세요.'),
  ('10000000-0000-0000-0000-000000000003', '데드리프트 (경량)', '허리', 3, ARRAY['덤벨'], '중급', 15, '허리 근력 강화', '가벼운 덤벨로 데드리프트 동작을 수행합니다.', '자세를 정확히 유지하세요.')
ON CONFLICT (id) DO NOTHING;

-- 재활운동 템플릿 (어깨)
INSERT INTO exercise_templates (id, name, body_part, pain_level, equipment_types, experience_level, duration_minutes, description, instructions, precautions) VALUES
  ('10000000-0000-0000-0000-000000000004', '팔 들어올리기', '어깨', 1, ARRAY['없음'], '초보', 10, '어깨 가동범위 개선', '서서 팔을 앞으로 천천히 들어올립니다.', '통증이 있으면 각도를 줄이세요.'),
  ('10000000-0000-0000-0000-000000000005', '외회전 운동', '어깨', 2, ARRAY['밴드'], '초보', 10, '어깨 외회전 근력 강화', '밴드를 사용해 팔을 바깥쪽으로 돌립니다.', '천천히 부드럽게 진행하세요.')
ON CONFLICT (id) DO NOTHING;

-- 재활운동 템플릿 (무릎)
INSERT INTO exercise_templates (id, name, body_part, pain_level, equipment_types, experience_level, duration_minutes, description, instructions, precautions) VALUES
  ('10000000-0000-0000-0000-000000000006', '무릎 굽히기', '무릎', 1, ARRAY['매트'], '초보', 10, '무릎 가동범위 개선', '누운 자세에서 무릎을 천천히 굽혔다 펴는 동작을 반복합니다.', '통증이 심하면 중단하세요.'),
  ('10000000-0000-0000-0000-000000000007', '다리 들어올리기', '무릎', 2, ARRAY['매트'], '초보', 10, '무릎 근력 강화', '누운 자세에서 다리를 곧게 펴고 들어올립니다.', '허리에 무리가 가지 않도록 주의하세요.')
ON CONFLICT (id) DO NOTHING;

-- Seed 리뷰 (운영자 작성)
INSERT INTO reviews (gym_id, user_id, tags, comment, is_admin_review) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', ARRAY['조용함', '재활친화', '장비 깨끗함'], '재활운동하기 정말 좋은 곳입니다. 조용하고 기구도 잘 갖춰져 있어요.', true),
  ('00000000-0000-0000-0000-000000000001', 'admin', ARRAY['조용함', '재활친화'], '평일 오후 시간대에 한산해서 좋아요.', true),
  ('00000000-0000-0000-0000-000000000002', 'admin', ARRAY['재활친화', 'PT/코치'], '필라테스 전문 코치가 있어서 도움을 많이 받았어요.', true),
  ('00000000-0000-0000-0000-000000000003', 'admin', ARRAY['조용함', '저렴함'], '가격이 저렴하고 조용해서 좋습니다.', true),
  ('00000000-0000-0000-0000-000000000004', 'admin', ARRAY['재활친화', 'PT/코치'], '재활 전문 센터라서 시설이 좋아요.', true),
  ('00000000-0000-0000-0000-000000000005', 'admin', ARRAY['조용함', '저렴함'], '학생들도 많이 오는 조용한 헬스장입니다.', true)
ON CONFLICT DO NOTHING;
