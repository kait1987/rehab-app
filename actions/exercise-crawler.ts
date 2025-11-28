"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * 운동 데이터 크롤링 및 저장
 * 주의: 실제 웹 크롤링은 robots.txt, 저작권, 이용약관을 준수해야 합니다.
 * 이 함수는 공개 API나 공개 데이터를 사용하는 것을 권장합니다.
 */

interface ExerciseData {
  name: string
  body_part: string
  pain_level: number
  equipment_types: string[]
  experience_level: string
  duration_minutes: number
  description: string
  instructions: string
  precautions: string
}

/**
 * 공개 운동 데이터 소스에서 운동 정보 가져오기
 * 실제 구현 시 공개 API나 공개 데이터셋을 사용하세요.
 */
async function fetchExerciseDataFromPublicSources(
  bodyPart: string,
  painLevel: number
): Promise<ExerciseData[]> {
  // 예시: 공개 운동 데이터베이스나 API 사용
  // 실제로는 ExerciseDB API, Open Exercise Database 등의 공개 API 사용 권장
  
  const exercises: ExerciseData[] = []
  
  // 예시 데이터 (실제로는 API 호출로 대체)
  // 여기서는 기본적인 재활운동 데이터를 반환
  const defaultExercises: Record<string, ExerciseData[]> = {
    허리: [
      {
        name: '고양이-소 자세',
        body_part: '허리',
        pain_level: 1,
        equipment_types: ['매트'],
        experience_level: '초보',
        duration_minutes: 5,
        description: '허리 스트레칭 기본 동작',
        instructions: '네 발로 엎드린 자세에서 등을 둥글게 만든 후(고양이) 반대로 휘게 만듭니다(소).',
        precautions: '목에 무리가 가지 않도록 주의하세요.'
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
        precautions: '목에 무리가 가지 않도록 주의하세요.'
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
        precautions: '허리에 통증이 있으면 중단하세요.'
      }
    ],
    어깨: [
      {
        name: '팔 들어올리기',
        body_part: '어깨',
        pain_level: 1,
        equipment_types: ['없음'],
        experience_level: '초보',
        duration_minutes: 10,
        description: '어깨 가동범위 개선',
        instructions: '서서 팔을 앞으로 천천히 들어올립니다.',
        precautions: '통증이 있으면 각도를 줄이세요.'
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
        precautions: '자세를 정확히 유지하세요.'
      }
    ],
    무릎: [
      {
        name: '무릎 굽히기',
        body_part: '무릎',
        pain_level: 1,
        equipment_types: ['매트'],
        experience_level: '초보',
        duration_minutes: 10,
        description: '무릎 가동범위 개선',
        instructions: '누운 자세에서 무릎을 천천히 굽혔다 펴는 동작을 반복합니다.',
        precautions: '통증이 심하면 중단하세요.'
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
        precautions: '무릎이 발끝을 넘지 않도록 주의하세요.'
      }
    ],
    목: [
      {
        name: '목 돌리기',
        body_part: '목',
        pain_level: 1,
        equipment_types: ['없음'],
        experience_level: '초보',
        duration_minutes: 5,
        description: '목 유연성 개선',
        instructions: '서서 목을 좌우로 천천히 돌립니다.',
        precautions: '무리하게 돌리지 마세요.'
      }
    ]
  }

  return defaultExercises[bodyPart] || []
}

/**
 * 운동 템플릿이 부족할 때 자동으로 추가
 */
export async function autoAddExerciseTemplates(
  bodyPart: string,
  painLevel: number
): Promise<{ success: boolean; added: number; error?: string }> {
  try {
    const supabase = await createClient()
    
    // 현재 해당 부위의 운동 템플릿 개수 확인
    const { data: existing, error: checkError } = await supabase
      .from("exercise_templates")
      .select("id, name")
      .eq("body_part", bodyPart)
      .lte("pain_level", painLevel)

    if (checkError) {
      return { success: false, added: 0, error: checkError.message }
    }

    // 운동이 5개 미만이면 추가
    if (existing && existing.length < 5) {
      const exerciseData = await fetchExerciseDataFromPublicSources(bodyPart, painLevel)
      const existingNames = new Set(existing.map(e => e.name))
      
      // 중복 제거
      const newExercises = exerciseData.filter(
        (ex) => !existingNames.has(ex.name)
      )

      if (newExercises.length > 0) {
        const { error: insertError } = await supabase
          .from("exercise_templates")
          .insert(newExercises)

        if (insertError) {
          return { success: false, added: 0, error: insertError.message }
        }

        return { success: true, added: newExercises.length }
      }
    }

    return { success: true, added: 0 }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    return { success: false, added: 0, error: errorMessage }
  }
}

/**
 * 공개 API를 사용한 운동 데이터 가져오기 (예시)
 * 실제 구현 시 ExerciseDB, Open Exercise Database 등의 API 사용
 */
export async function fetchExercisesFromPublicAPI(
  bodyPart: string
): Promise<ExerciseData[]> {
  // 예시: ExerciseDB API 사용 (실제 API 키 필요)
  // const response = await fetch(`https://api.exercisedb.io/v1/exercises?bodyPart=${bodyPart}`)
  // const data = await response.json()
  
  // 현재는 기본 데이터 반환
  return []
}

