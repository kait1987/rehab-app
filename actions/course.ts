"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CourseQuestionnaire } from "@/types"

export async function generateCourse(questionnaire: CourseQuestionnaire) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.warn('인증 오류 (익명 사용자로 진행):', authError.message)
    }

  const userId = user?.id || `anonymous_${Date.now()}`

  // 운동 템플릿 가져오기
  let query = supabase
    .from("exercise_templates")
    .select("*")
    .eq("body_part", questionnaire.bodyPart)

  // 통증 레벨 필터링 (통증이 높으면 낮은 레벨 운동만)
  // 통증 1-2: 모든 레벨 가능, 통증 3: 레벨 1-3, 통증 4-5: 레벨 1-2만
  if (questionnaire.painLevel >= 4) {
    query = query.lte("pain_level", 2)
  } else if (questionnaire.painLevel === 3) {
    query = query.lte("pain_level", 3) // 통증 3이면 레벨 1, 2, 3 모두 포함
  }
  // 통증 1-2는 필터링 없음 (모든 레벨 포함)

  // 경험 수준 필터링
  if (questionnaire.experienceLevel === "거의 안 함") {
    query = query.eq("experience_level", "초보")
  } else if (questionnaire.experienceLevel === "주 1-2회") {
    query = query.in("experience_level", ["초보", "중급"])
  }

  let { data: templates, error: templateError } = await query

  if (templateError) {
    console.error('운동 템플릿 조회 오류:', templateError)
    
    // 테이블이 없는 경우 명확한 안내 메시지 제공
    if (templateError.message?.includes('schema cache') || 
        templateError.message?.includes('relation') ||
        templateError.message?.includes('does not exist')) {
      return { 
        error: `데이터베이스 테이블이 없습니다. Supabase 대시보드의 SQL Editor에서 'lib/db/schema.sql' 파일의 내용을 실행하세요. 자세한 내용은 SUPABASE_SETUP.md를 참조하세요. (오류: ${templateError.message})`
      }
    }
    
    return { error: `운동 템플릿을 불러오는 중 오류가 발생했습니다: ${templateError.message}` }
  }

  // 운동 템플릿이 부족하면 자동으로 추가 시도
  if (!templates || templates.length === 0) {
    // 자동으로 운동 템플릿 추가 시도
    const { autoAddExerciseTemplates } = await import('./exercise-crawler')
    const addResult = await autoAddExerciseTemplates(
      questionnaire.bodyPart,
      questionnaire.painLevel
    )
    
    if (addResult.success && addResult.added > 0) {
      // 다시 템플릿 조회
      const result = await query
      if (result.data && result.data.length > 0) {
        templates = result.data
      }
    }
  }

  if (!templates || templates.length === 0) {
    const equipmentDisplay = questionnaire.equipmentTypes && questionnaire.equipmentTypes.length > 0 
      ? questionnaire.equipmentTypes.join(', ') 
      : '없음'
    return { 
      error: `조건에 맞는 운동 템플릿을 찾을 수 없습니다. (부위: ${questionnaire.bodyPart}, 통증: ${questionnaire.painLevel}, 기구: ${equipmentDisplay}, 경험: ${questionnaire.experienceLevel})` 
    }
  }

  // 기구 필터링 (클라이언트 측에서 필터링 - 더 유연하게)
  let filteredTemplates = templates
  if (questionnaire.equipmentTypes && questionnaire.equipmentTypes.length > 0) {
    console.log('기구 필터링 시작:', {
      requested: questionnaire.equipmentTypes,
      templatesCount: templates.length
    })
    
    // 선택한 기구 중 하나라도 포함된 운동을 찾음
    filteredTemplates = templates.filter((template: any) => {
      // 템플릿에 기구 정보가 없는 경우
      if (!template.equipment_types || template.equipment_types.length === 0) {
        // 사용자가 "없음"을 선택한 경우만 포함
        return questionnaire.equipmentTypes.includes('없음')
      }
      
      // 선택한 기구 중 하나라도 템플릿에 포함되어 있으면 OK
      const hasMatchingEquipment = questionnaire.equipmentTypes.some((eq: string) => 
        Array.isArray(template.equipment_types) && template.equipment_types.includes(eq)
      )
      
      return hasMatchingEquipment
    })
    
    console.log('기구 필터링 후:', {
      filteredCount: filteredTemplates.length,
      filteredTemplates: filteredTemplates.map((t: any) => ({
        name: t.name,
        equipment: t.equipment_types
      }))
    })
  }

  // 필터링 후에도 결과가 없으면 기구 필터를 단계적으로 완화
  if (filteredTemplates.length === 0 && questionnaire.equipmentTypes && questionnaire.equipmentTypes.length > 0) {
    console.warn('기구 필터로 인해 결과가 없어 필터를 완화합니다.')
    
    // 1단계: "없음" 기구도 포함하도록 완화
    filteredTemplates = templates.filter((template: any) => {
      if (!template.equipment_types || template.equipment_types.length === 0) {
        return true // 기구가 없는 운동도 포함
      }
      // 선택한 기구 중 하나라도 템플릿에 포함되어 있으면 OK
      return questionnaire.equipmentTypes.some((eq: string) => 
        Array.isArray(template.equipment_types) && template.equipment_types.includes(eq)
      )
    })
    
    // 2단계: 여전히 결과가 없으면 기구 필터 완전 제거
    if (filteredTemplates.length === 0) {
      console.warn('기구 필터를 완전히 제거합니다.')
      filteredTemplates = templates
    }
  }

  // 최종적으로도 결과가 없으면 에러 반환 (이 경우는 매우 드뭄)
  if (filteredTemplates.length === 0) {
    const equipmentDisplay = questionnaire.equipmentTypes && questionnaire.equipmentTypes.length > 0 
      ? questionnaire.equipmentTypes.join(', ') 
      : '없음'
    console.error('모든 필터를 완화했지만 여전히 결과가 없습니다:', {
      bodyPart: questionnaire.bodyPart,
      painLevel: questionnaire.painLevel,
      equipmentTypes: questionnaire.equipmentTypes,
      experienceLevel: questionnaire.experienceLevel,
      templatesCount: templates.length
    })
    return { 
      error: `조건에 맞는 운동 템플릿을 찾을 수 없습니다. 다른 기구를 선택하거나 다른 조건으로 시도해보세요. (부위: ${questionnaire.bodyPart}, 통증: ${questionnaire.painLevel}, 기구: ${equipmentDisplay}, 경험: ${questionnaire.experienceLevel})` 
    }
  }

  // 필터링된 템플릿 사용
  const finalTemplates = filteredTemplates

  // 코스 생성
  const totalDuration = questionnaire.duration || 90
  const warmupDuration = Math.floor(totalDuration * 0.15) // 15%
  const mainDuration = Math.floor(totalDuration * 0.65) // 65%
  const cooldownDuration = totalDuration - warmupDuration - mainDuration // 20%

  const { data: course, error: courseError } = await supabase
    .from("user_courses")
    .insert({
      user_id: userId,
      body_part: questionnaire.bodyPart,
      pain_level: questionnaire.painLevel,
      equipment_types: questionnaire.equipmentTypes,
      experience_level: questionnaire.experienceLevel,
      total_duration: totalDuration,
      warmup_duration: warmupDuration,
      main_duration: mainDuration,
      cooldown_duration: cooldownDuration,
    })
    .select()
    .single()

  if (courseError) {
    return { error: courseError.message }
  }

  // 운동 배정
  const exercises: any[] = []
  let warmupTime = 0
  let mainTime = 0
  let cooldownTime = 0
  const usedTemplateIds = new Set<string>() // 이미 사용된 템플릿 ID 추적
  const usedExerciseNames = new Set<string>() // 운동 이름 중복 방지 (추가 안전장치)

  // 준비운동 (스트레칭 위주, 5분 이하 우선)
  const warmupCandidates = finalTemplates
    .filter((t) => 
      !usedTemplateIds.has(t.id) && 
      !usedExerciseNames.has(t.name) && 
      t.duration_minutes <= 10
    )
    .sort((a, b) => a.duration_minutes - b.duration_minutes) // 짧은 것부터
  
  // 운동이 부족하면 조건 완화
  let warmupTemplates = warmupCandidates.slice(0, 3)
  if (warmupTemplates.length < 3) {
    // 10분 이하 운동이 부족하면 15분 이하로 확장
    const extendedWarmup = finalTemplates
      .filter((t) => 
        !usedTemplateIds.has(t.id) && 
        !usedExerciseNames.has(t.name) && 
        t.duration_minutes <= 15
      )
      .sort((a, b) => a.duration_minutes - b.duration_minutes)
    warmupTemplates = [...warmupTemplates, ...extendedWarmup.slice(0, 3 - warmupTemplates.length)]
  }

  warmupTemplates.forEach((template, index) => {
    usedTemplateIds.add(template.id)
    usedExerciseNames.add(template.name)
    exercises.push({
      course_id: course.id,
      exercise_template_id: template.id,
      exercise_name: template.name,
      section: "warmup",
      duration_seconds: template.duration_minutes * 60,
      order_index: index,
    })
    warmupTime += template.duration_minutes
  })

  // 메인 운동 (10분 이상, 강도 높은 운동)
  const mainCandidates = finalTemplates
    .filter((t) => 
      !usedTemplateIds.has(t.id) && 
      !usedExerciseNames.has(t.name) && 
      t.duration_minutes >= 10
    )
    .sort((a, b) => b.duration_minutes - a.duration_minutes) // 긴 것부터
  
  const mainCount = Math.max(1, Math.floor(mainDuration / 15)) // 최소 1개
  let mainTemplates = mainCandidates.slice(0, mainCount)
  
  // 운동이 부족하면 조건 완화
  if (mainTemplates.length < mainCount) {
    // 5분 이상 운동으로 확장
    const extendedMain = finalTemplates
      .filter((t) => 
        !usedTemplateIds.has(t.id) && 
        !usedExerciseNames.has(t.name) && 
        t.duration_minutes >= 5
      )
      .sort((a, b) => b.duration_minutes - a.duration_minutes)
    mainTemplates = [...mainTemplates, ...extendedMain.slice(0, mainCount - mainTemplates.length)]
  }

  mainTemplates.forEach((template, index) => {
    usedTemplateIds.add(template.id)
    usedExerciseNames.add(template.name)
    exercises.push({
      course_id: course.id,
      exercise_template_id: template.id,
      exercise_name: template.name,
      section: "main",
      sets: 3,
      reps: 10,
      duration_seconds: template.duration_minutes * 60,
      rest_seconds: 60,
      order_index: index,
    })
    mainTime += template.duration_minutes
  })

  // 마무리 스트레칭 (5-10분, 준비운동과 다른 운동)
  const cooldownCandidates = finalTemplates
    .filter((t) => 
      !usedTemplateIds.has(t.id) && 
      !usedExerciseNames.has(t.name) && 
      t.duration_minutes <= 10
    )
    .sort((a, b) => a.duration_minutes - b.duration_minutes) // 짧은 것부터
  
  let cooldownTemplates = cooldownCandidates.slice(0, 2)
  
  // 운동이 부족하면 조건 완화
  if (cooldownTemplates.length < 2) {
    // 15분 이하 운동으로 확장
    const extendedCooldown = finalTemplates
      .filter((t) => 
        !usedTemplateIds.has(t.id) && 
        !usedExerciseNames.has(t.name) && 
        t.duration_minutes <= 15
      )
      .sort((a, b) => a.duration_minutes - b.duration_minutes)
    cooldownTemplates = [...cooldownTemplates, ...extendedCooldown.slice(0, 2 - cooldownTemplates.length)]
  }

  cooldownTemplates.forEach((template, index) => {
    usedTemplateIds.add(template.id)
    usedExerciseNames.add(template.name)
    exercises.push({
      course_id: course.id,
      exercise_template_id: template.id,
      exercise_name: template.name,
      section: "cooldown",
      duration_seconds: template.duration_minutes * 60,
      order_index: index,
    })
    cooldownTime += template.duration_minutes
  })

  // 운동이 부족한 경우 경고 로그
  if (exercises.length < 5) {
    console.warn('운동 템플릿이 부족합니다. 더 많은 운동 데이터를 추가해주세요.', {
      totalExercises: exercises.length,
      warmupCount: warmupTemplates.length,
      mainCount: mainTemplates.length,
      cooldownCount: cooldownTemplates.length,
      availableTemplates: finalTemplates.length
    })
  }

  // 운동 저장
  if (exercises.length > 0) {
    const { error: exerciseError } = await supabase
      .from("course_exercises")
      .insert(exercises)

    if (exerciseError) {
      return { error: exerciseError.message }
    }
  }

  // 생성된 코스와 운동 가져오기
  const { data: courseWithExercises, error: fetchError } = await supabase
    .from("user_courses")
    .select(`
      *,
      course_exercises (
        *,
        exercise_templates (*)
      )
    `)
    .eq("id", course.id)
    .single()

  if (fetchError) {
    console.error('코스 조회 오류:', fetchError)
    return { error: `생성된 코스를 불러오는 중 오류가 발생했습니다: ${fetchError.message}` }
  }

  if (!courseWithExercises) {
    console.error('코스 데이터가 null입니다.')
    return { error: '생성된 코스 데이터를 찾을 수 없습니다.' }
  }

  console.log('생성된 코스:', courseWithExercises)

  revalidatePath("/course")
  return { success: true, data: courseWithExercises }
  } catch (error) {
    console.error('코스 생성 오류:', error)
    const errorMessage = error instanceof Error 
      ? error.message 
      : '코스를 생성하는 중 오류가 발생했습니다.'
    
    // Supabase 연결 오류인 경우 명확한 메시지 제공
    if (errorMessage.includes('Supabase') || errorMessage.includes('환경 변수')) {
      return { 
        error: '데이터베이스 연결에 실패했습니다. Supabase 설정을 확인하세요. 자세한 내용은 SUPABASE_SETUP.md를 참조하세요.' 
      }
    }
    
    return { error: errorMessage }
  }
}

