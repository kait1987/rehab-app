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

  // 실제 운동 배정 후 시간 계산 (임시로 예상 시간 사용)
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

  // 운동 배정 - 시간 기반 정확한 배정
  const exercises: any[] = []
  const usedTemplateIds = new Set<string>() // 이미 사용된 템플릿 ID 추적
  const usedExerciseNames = new Set<string>() // 운동 이름 중복 방지

  // 사용 가능한 운동을 섞어서 다양하게 선택
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // 준비운동 선택 - 시간에 맞춰서
  const getAvailableTemplates = (usedIds: Set<string>, usedNames: Set<string>) => {
    return finalTemplates.filter((t) => 
      !usedIds.has(t.id) && !usedNames.has(t.name)
    )
  }

  let remainingTime = warmupDuration
  const warmupTemplates: any[] = []
  const warmupCandidates = shuffleArray(
    getAvailableTemplates(usedTemplateIds, usedExerciseNames)
      .filter((t) => t.duration_minutes <= 15) // 준비운동은 15분 이하
      .sort((a, b) => a.duration_minutes - b.duration_minutes)
  )

  // 준비운동: 목표 시간에 맞춰서 선택 (최소 2개, 최대 5개)
  for (const template of warmupCandidates) {
    if (remainingTime <= 0) break
    if (warmupTemplates.length >= 5) break
    
    if (template.duration_minutes <= remainingTime) {
      warmupTemplates.push(template)
      usedTemplateIds.add(template.id)
      usedExerciseNames.add(template.name)
      remainingTime -= template.duration_minutes
    }
  }

  // 최소 2개는 보장
  if (warmupTemplates.length < 2) {
    const additional = warmupCandidates
      .filter((t) => !usedTemplateIds.has(t.id))
      .slice(0, 2 - warmupTemplates.length)
    warmupTemplates.push(...additional)
    additional.forEach(t => {
      usedTemplateIds.add(t.id)
      usedExerciseNames.add(t.name)
    })
  }

  warmupTemplates.forEach((template, index) => {
    exercises.push({
      course_id: course.id,
      exercise_template_id: template.id,
      exercise_name: template.name,
      section: "warmup",
      duration_seconds: template.duration_minutes * 60,
      order_index: index,
    })
  })

  const actualWarmupTime = warmupTemplates.reduce((sum, t) => sum + t.duration_minutes, 0)

  // 메인 운동 선택 - 시간에 맞춰서
  remainingTime = mainDuration
  const mainTemplates: any[] = []
  const mainCandidates = shuffleArray(
    getAvailableTemplates(usedTemplateIds, usedExerciseNames)
      .filter((t) => t.duration_minutes >= 5) // 메인 운동은 5분 이상
      .sort((a, b) => b.duration_minutes - a.duration_minutes) // 긴 것부터
  )

  // 메인 운동: 목표 시간에 맞춰서 선택
  for (const template of mainCandidates) {
    if (remainingTime <= 0) break
    if (mainTemplates.length >= 8) break // 최대 8개
    
    if (template.duration_minutes <= remainingTime) {
      mainTemplates.push(template)
      usedTemplateIds.add(template.id)
      usedExerciseNames.add(template.name)
      remainingTime -= template.duration_minutes
    }
  }

  // 최소 1개는 보장
  if (mainTemplates.length === 0) {
    const first = mainCandidates.find((t) => !usedTemplateIds.has(t.id))
    if (first) {
      mainTemplates.push(first)
      usedTemplateIds.add(first.id)
      usedExerciseNames.add(first.name)
    }
  }

  mainTemplates.forEach((template, index) => {
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
  })

  const actualMainTime = mainTemplates.reduce((sum, t) => sum + t.duration_minutes, 0)

  // 마무리 운동 선택 - 반드시 생성, 시간에 맞춰서
  remainingTime = cooldownDuration
  const cooldownTemplates: any[] = []
  const cooldownCandidates = shuffleArray(
    getAvailableTemplates(usedTemplateIds, usedExerciseNames)
      .filter((t) => t.duration_minutes <= 15) // 마무리 운동은 15분 이하
      .sort((a, b) => a.duration_minutes - b.duration_minutes)
  )

  // 마무리 운동: 목표 시간에 맞춰서 선택 (최소 2개)
  for (const template of cooldownCandidates) {
    if (remainingTime <= 0 && cooldownTemplates.length >= 2) break
    if (cooldownTemplates.length >= 5) break
    
    if (template.duration_minutes <= remainingTime || cooldownTemplates.length < 2) {
      cooldownTemplates.push(template)
      usedTemplateIds.add(template.id)
      usedExerciseNames.add(template.name)
      if (remainingTime > 0) {
        remainingTime -= template.duration_minutes
      }
    }
  }

  // 최소 2개는 반드시 보장
  if (cooldownTemplates.length < 2) {
    const additional = cooldownCandidates
      .filter((t) => !usedTemplateIds.has(t.id))
      .slice(0, 2 - cooldownTemplates.length)
    cooldownTemplates.push(...additional)
    additional.forEach(t => {
      usedTemplateIds.add(t.id)
      usedExerciseNames.add(t.name)
    })
  }

  cooldownTemplates.forEach((template, index) => {
    exercises.push({
      course_id: course.id,
      exercise_template_id: template.id,
      exercise_name: template.name,
      section: "cooldown",
      duration_seconds: template.duration_minutes * 60,
      order_index: index,
    })
  })

  const actualCooldownTime = cooldownTemplates.reduce((sum, t) => sum + t.duration_minutes, 0)
  
  // 실제 시간으로 업데이트
  const actualTotalTime = actualWarmupTime + actualMainTime + actualCooldownTime

  // 실제 시간으로 코스 업데이트
  if (course) {
    await supabase
      .from("user_courses")
      .update({
        warmup_duration: actualWarmupTime,
        main_duration: actualMainTime,
        cooldown_duration: actualCooldownTime,
        total_duration: actualTotalTime,
      })
      .eq("id", course.id)
  }

  // 운동 배정 완료 로그
  console.log('운동 배정 완료:', {
    totalExercises: exercises.length,
    warmupCount: warmupTemplates.length,
    mainCount: mainTemplates.length,
    cooldownCount: cooldownTemplates.length,
    warmupTime: actualWarmupTime,
    mainTime: actualMainTime,
    cooldownTime: actualCooldownTime,
    totalTime: actualTotalTime,
    targetTime: totalDuration,
    warmupNames: warmupTemplates.map(t => t.name),
    mainNames: mainTemplates.map(t => t.name),
    cooldownNames: cooldownTemplates.map(t => t.name),
    uniqueExercises: usedTemplateIds.size
  })
  
  // 검증: 마무리 운동이 반드시 있어야 함
  if (cooldownTemplates.length === 0) {
    console.error('마무리 운동이 생성되지 않았습니다!')
    // 강제로 마무리 운동 추가
    const anyRemaining = finalTemplates
      .filter((t) => !usedTemplateIds.has(t.id))
      .slice(0, 2)
    if (anyRemaining.length > 0) {
      anyRemaining.forEach((template, index) => {
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
      })
      console.log('마무리 운동 강제 추가:', anyRemaining.map(t => t.name))
    }
  }
  
  // 검증: 중복 확인
  const exerciseNames = exercises.map(e => e.exercise_name)
  const uniqueNames = new Set(exerciseNames)
  if (exerciseNames.length !== uniqueNames.size) {
    console.error('중복된 운동이 발견되었습니다!', {
      total: exerciseNames.length,
      unique: uniqueNames.size,
      duplicates: exerciseNames.filter((name, index) => exerciseNames.indexOf(name) !== index)
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

