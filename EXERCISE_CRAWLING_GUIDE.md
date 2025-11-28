# 운동 데이터 크롤링 가이드

## ⚠️ 중요 사항

웹 크롤링은 법적, 윤리적 문제가 있을 수 있습니다. 다음 사항을 반드시 확인하세요:

1. **robots.txt 확인**: 크롤링 전에 대상 사이트의 robots.txt를 확인하세요
2. **이용약관 확인**: 크롤링이 허용되는지 확인하세요
3. **저작권**: 저작권이 있는 콘텐츠는 사용할 수 없습니다
4. **공개 API 우선**: 가능하면 공개 API나 공개 데이터셋을 사용하세요

## 추천 방법

### 1. 공개 API 사용 (권장)

#### ExerciseDB API
- URL: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
- 무료 플랜 제공
- 운동 데이터 제공

#### Open Exercise Database
- 공개 운동 데이터베이스
- API 또는 직접 다운로드 가능

### 2. 공개 데이터셋 사용

#### Kaggle
- 운동 관련 데이터셋 검색
- 예: "exercise database", "fitness exercises"

#### GitHub
- 공개 운동 데이터 저장소 검색
- 예: "exercise-database", "fitness-data"

### 3. 수동 데이터 입력

가장 안전한 방법은 수동으로 운동 데이터를 추가하는 것입니다.

## 사용 방법

### 자동 크롤링 (운동 부족 시)

코스 생성 시 운동 템플릿이 부족하면 자동으로 기본 운동을 추가합니다.

```typescript
// actions/course.ts에서 자동 호출됨
const { autoAddExerciseTemplates } = await import('./exercise-crawler')
await autoAddExerciseTemplates(bodyPart, painLevel)
```

### 수동 크롤링 스크립트 실행

```bash
# 환경 변수 설정
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# 스크립트 실행
npx tsx scripts/scrape-exercises.ts
```

## 공개 API 통합 예시

### ExerciseDB API 사용

```typescript
async function fetchFromExerciseDB(bodyPart: string) {
  const response = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
    {
      headers: {
        'X-RapidAPI-Key': 'your-api-key',
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    }
  )
  const data = await response.json()
  // 데이터 변환 및 저장
}
```

## 해외 사이트 크롤링

### 주의사항

1. **법적 문제**: 해외 사이트 크롤링은 해당 국가의 법률을 준수해야 합니다
2. **언어 처리**: 다국어 데이터 처리 필요
3. **데이터 변환**: 단위 변환 (파운드 → 킬로그램 등)

### 추천 해외 소스

1. **ExerciseDB** (영어)
   - 공개 API 제공
   - 다양한 운동 데이터

2. **Bodybuilding.com** (영어)
   - 공개 운동 데이터베이스
   - 크롤링 전 이용약관 확인 필수

3. **ExRx.net** (영어)
   - 운동 과학 데이터베이스
   - 공개 데이터 제공

## 데이터 구조

운동 템플릿은 다음 구조를 따라야 합니다:

```typescript
{
  name: string              // 운동 이름
  body_part: string        // 부위 (허리, 어깨, 무릎, 목)
  pain_level: number       // 통증 레벨 (1-5)
  equipment_types: string[] // 기구 종류 (없음, 매트, 덤벨, 머신, 밴드, 짐볼)
  experience_level: string  // 경험 수준 (초보, 중급, 고급)
  duration_minutes: number  // 운동 시간 (분)
  description: string       // 설명
  instructions: string      // 방법
  precautions: string       // 주의사항
}
```

## 현재 구현

현재는 기본 재활운동 데이터를 제공합니다. 실제 크롤링을 구현하려면:

1. `actions/exercise-crawler.ts`의 `fetchExerciseDataFromPublicSources` 함수 수정
2. 공개 API 키 추가
3. 데이터 변환 로직 추가

## 추가 운동 데이터

더 많은 운동 데이터를 추가하려면:

1. `lib/db/expanded_exercise_templates.sql` 파일에 SQL 추가
2. Supabase SQL Editor에서 실행
3. 또는 `scripts/scrape-exercises.ts` 스크립트 수정 후 실행

## 문제 해결

### 운동이 여전히 중복되는 경우

1. 데이터베이스에 운동이 충분한지 확인
2. 필터링 조건이 너무 제한적인지 확인
3. `usedTemplateIds`와 `usedExerciseNames`가 제대로 작동하는지 확인

### 크롤링이 작동하지 않는 경우

1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase 연결이 정상인지 확인
3. API 키가 유효한지 확인 (공개 API 사용 시)

