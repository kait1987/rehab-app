# 템플릿 필터링 문제 해결 가이드

## 문제 원인

"조건에 맞는 운동 템플릿을 찾을 수 없습니다" 오류가 발생하는 이유:

### 1. 기구 필터링이 너무 엄격함
- 사용자가 "머신"을 선택했지만, 데이터베이스에 "머신"을 사용하는 어깨 운동이 없을 수 있음
- Supabase의 `contains()` 함수가 배열 필터링에서 예상대로 작동하지 않을 수 있음

### 2. 통증 레벨 필터링
- 통증 레벨 4인 경우, pain_level <= 2인 운동만 선택
- 이 조건을 만족하는 운동이 적을 수 있음

### 3. 데이터 부족
- 특정 부위 + 기구 조합에 대한 운동 데이터가 없을 수 있음

## 해결 방법

### 방법 1: 코드 수정 (완료됨)

코드가 수정되어 다음과 같이 작동합니다:

1. **기구 필터링을 클라이언트 측에서 처리**
   - 선택한 기구 중 하나라도 포함된 운동을 찾음
   - 기구가 "없음"인 운동도 포함 가능

2. **필터 완화 로직 추가**
   - 기구 필터로 결과가 없으면 기구 필터를 제거하고 다시 검색
   - 부위, 통증, 경험 수준만으로도 운동을 찾을 수 있음

3. **더 명확한 에러 메시지**
   - 어떤 조건으로 검색했는지 표시

### 방법 2: 데이터 추가 (권장)

Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- 어깨 + 머신 운동 추가
INSERT INTO exercise_templates (id, name, body_part, pain_level, equipment_types, experience_level, duration_minutes, description, instructions, precautions) VALUES
  ('10000000-0000-0000-0000-000000000033', '케이블 사이드 레이즈', '어깨', 2, ARRAY['머신'], '초보', 10, '어깨 측면 근력 강화', '케이블 머신을 사용해 팔을 옆으로 들어올립니다.', '무리하지 마세요.'),
  ('10000000-0000-0000-0000-000000000034', '케이블 프론트 레이즈', '어깨', 2, ARRAY['머신'], '초보', 10, '어깨 전면 근력 강화', '케이블 머신을 사용해 팔을 앞으로 들어올립니다.', '자세를 정확히 유지하세요.'),
  ('10000000-0000-0000-0000-000000000035', '어깨 프레스 머신', '어깨', 2, ARRAY['머신'], '초보', 15, '어깨 전면 근력 강화', '어깨 프레스 머신을 사용해 위로 밀어올립니다.', '통증이 있으면 중단하세요.')
ON CONFLICT (id) DO NOTHING;
```

### 방법 3: 전체 seed 데이터 실행

`lib/db/seed.sql` 파일의 전체 내용을 Supabase SQL Editor에서 실행하세요.

## 확인 방법

### 1. 데이터베이스에 데이터가 있는지 확인

Supabase SQL Editor에서:

```sql
-- 어깨 운동 확인
SELECT name, body_part, pain_level, equipment_types, experience_level 
FROM exercise_templates 
WHERE body_part = '어깨';
```

### 2. 필터링 테스트

```sql
-- 통증 레벨 4인 경우 (pain_level <= 2만 선택)
SELECT name, body_part, pain_level, equipment_types, experience_level 
FROM exercise_templates 
WHERE body_part = '어깨' 
  AND pain_level <= 2
  AND experience_level IN ('초보', '중급');
```

### 3. 기구 필터링 테스트

```sql
-- 머신을 사용하는 어깨 운동
SELECT name, body_part, pain_level, equipment_types, experience_level 
FROM exercise_templates 
WHERE body_part = '어깨' 
  AND '머신' = ANY(equipment_types);
```

## 수정된 코드 동작 방식

1. **1차 필터링**: 부위, 통증 레벨, 경험 수준으로 DB에서 검색
2. **2차 필터링**: 클라이언트 측에서 기구 필터 적용 (더 유연하게)
3. **필터 완화**: 기구 필터로 결과가 없으면 기구 필터 제거
4. **에러 메시지**: 어떤 조건으로 검색했는지 표시

이제 더 많은 경우에 운동 템플릿을 찾을 수 있습니다!

