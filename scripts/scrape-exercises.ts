/**
 * 운동 데이터 크롤링 스크립트
 * 
 * 주의사항:
 * 1. 웹 크롤링 시 robots.txt와 이용약관을 확인하세요
 * 2. 저작권이 있는 콘텐츠는 사용할 수 없습니다
 * 3. 공개 API나 공개 데이터셋 사용을 권장합니다
 * 
 * 사용 방법:
 * npx tsx scripts/scrape-exercises.ts
 */

import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 생성 (환경 변수 필요)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface ExerciseSource {
  name: string
  body_part: string
  pain_level: number
  equipment_types: string[]
  experience_level: string
  duration_minutes: number
  description: string
  instructions: string
  precautions: string
  source?: string
}

/**
 * 공개 운동 데이터베이스에서 운동 정보 수집
 * 실제 구현 시 ExerciseDB, Open Exercise Database 등의 API 사용
 */
async function scrapeFromPublicSources(): Promise<ExerciseSource[]> {
  const exercises: ExerciseSource[] = []

  // 예시: ExerciseDB API 사용 (실제 API 키 필요)
  // try {
  //   const response = await fetch('https://api.exercisedb.io/v1/exercises')
  //   const data = await response.json()
  //   // 데이터 변환 및 저장
  // } catch (error) {
  //   console.error('API 호출 실패:', error)
  // }

  // 예시: 웹 크롤링 (주의: robots.txt 확인 필수)
  // const cheerio = require('cheerio')
  // const response = await fetch('https://example.com/exercises')
  // const html = await response.text()
  // const $ = cheerio.load(html)
  // // HTML 파싱 및 데이터 추출

  // 현재는 기본 재활운동 데이터 반환
  const defaultExercises: ExerciseSource[] = [
    // 허리 재활운동
    {
      name: '고양이-소 자세',
      body_part: '허리',
      pain_level: 1,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '허리 스트레칭 기본 동작',
      instructions: '네 발로 엎드린 자세에서 등을 둥글게 만든 후(고양이) 반대로 휘게 만듭니다(소).',
      precautions: '목에 무리가 가지 않도록 주의하세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '무릎 가슴 당기기',
      body_part: '허리',
      pain_level: 1,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '허리 통증 완화 스트레칭',
      instructions: '누운 자세에서 무릎을 가슴 쪽으로 천천히 당깁니다.',
      precautions: '통증이 심하면 중단하세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '브릿지',
      body_part: '허리',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '허리 및 엉덩이 근력 강화',
      instructions: '누운 자세에서 무릎을 구부리고 엉덩이를 들어올립니다.',
      precautions: '목에 무리가 가지 않도록 주의하세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '슈퍼맨 자세',
      body_part: '허리',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '허리 뒤쪽 근력 강화',
      instructions: '엎드린 자세에서 팔과 다리를 들어올립니다.',
      precautions: '목에 무리가 가지 않도록 주의하세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '플랭크',
      body_part: '허리',
      pain_level: 3,
      equipment_types: ['매트'],
      experience_level: '중급',
      duration_minutes: 10,
      description: '코어 근력 강화',
      instructions: '팔꿈치와 발끝으로 몸을 지지하는 자세를 유지합니다.',
      precautions: '허리에 통증이 있으면 중단하세요.',
      source: '기본 재활운동 데이터'
    },
    // 어깨 재활운동
    {
      name: '팔 들어올리기',
      body_part: '어깨',
      pain_level: 1,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '어깨 가동범위 개선',
      instructions: '서서 팔을 앞으로 천천히 들어올립니다.',
      precautions: '통증이 있으면 각도를 줄이세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '어깨 원 그리기',
      body_part: '어깨',
      pain_level: 1,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '어깨 가동범위 개선',
      instructions: '팔을 앞뒤로 원을 그리듯 움직입니다.',
      precautions: '통증이 있으면 범위를 줄이세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '벽 밀기',
      body_part: '어깨',
      pain_level: 2,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '어깨 근력 강화',
      instructions: '벽을 향해 팔을 뻗어 밀어줍니다.',
      precautions: '자세를 정확히 유지하세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '밴드 외회전',
      body_part: '어깨',
      pain_level: 2,
      equipment_types: ['밴드'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '어깨 외회전 근력 강화',
      instructions: '밴드를 사용해 팔을 바깥쪽으로 돌립니다.',
      precautions: '천천히 부드럽게 진행하세요.',
      source: '기본 재활운동 데이터'
    },
    // 무릎 재활운동
    {
      name: '무릎 굽히기',
      body_part: '무릎',
      pain_level: 1,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '무릎 가동범위 개선',
      instructions: '누운 자세에서 무릎을 천천히 굽혔다 펴는 동작을 반복합니다.',
      precautions: '통증이 심하면 중단하세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '다리 들어올리기',
      body_part: '무릎',
      pain_level: 2,
      equipment_types: ['매트'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '무릎 근력 강화',
      instructions: '누운 자세에서 다리를 곧게 펴고 들어올립니다.',
      precautions: '허리에 무리가 가지 않도록 주의하세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '스쿼트',
      body_part: '무릎',
      pain_level: 2,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 10,
      description: '무릎 및 다리 근력 강화',
      instructions: '서서 무릎을 구부려 앉았다 일어나는 동작을 반복합니다.',
      precautions: '무릎이 발끝을 넘지 않도록 주의하세요.',
      source: '기본 재활운동 데이터'
    },
    // 목 재활운동
    {
      name: '목 돌리기',
      body_part: '목',
      pain_level: 1,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '목 유연성 개선',
      instructions: '서서 목을 좌우로 천천히 돌립니다.',
      precautions: '무리하게 돌리지 마세요.',
      source: '기본 재활운동 데이터'
    },
    {
      name: '목 앞뒤 스트레칭',
      body_part: '목',
      pain_level: 1,
      equipment_types: ['없음'],
      experience_level: '초보',
      duration_minutes: 5,
      description: '목 스트레칭',
      instructions: '목을 앞뒤로 천천히 움직입니다.',
      precautions: '천천히 부드럽게 진행하세요.',
      source: '기본 재활운동 데이터'
    }
  ]

  return exercises
}

/**
 * 운동 데이터를 Supabase에 저장
 */
async function saveExercisesToDatabase(exercises: ExerciseSource[]): Promise<void> {
  // 기존 운동 이름 확인
  const { data: existing } = await supabase
    .from("exercise_templates")
    .select("name")

  const existingNames = new Set(existing?.map(e => e.name) || [])
  
  // 중복 제거
  const newExercises = exercises.filter(
    (ex) => !existingNames.has(ex.name)
  )

  if (newExercises.length === 0) {
    console.log('추가할 새로운 운동이 없습니다.')
    return
  }

  // 데이터베이스에 저장
  const { error } = await supabase
    .from("exercise_templates")
    .insert(newExercises.map(({ source, ...ex }) => ex))

  if (error) {
    console.error('운동 데이터 저장 실패:', error)
    throw error
  }

  console.log(`${newExercises.length}개의 운동이 추가되었습니다.`)
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('운동 데이터 크롤링 시작...')
  
  try {
    // 공개 소스에서 운동 데이터 수집
    const exercises = await scrapeFromPublicSources()
    console.log(`${exercises.length}개의 운동 데이터를 수집했습니다.`)

    // 데이터베이스에 저장
    await saveExercisesToDatabase(exercises)
    
    console.log('운동 데이터 크롤링 완료!')
  } catch (error) {
    console.error('크롤링 오류:', error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export { scrapeFromPublicSources, saveExercisesToDatabase }

