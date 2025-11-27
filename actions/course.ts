"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CourseQuestionnaire } from "@/types"

export async function generateCourse(questionnaire: CourseQuestionnaire) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id || `anonymous_${Date.now()}`

  // 운동 템플릿 가져오기
  let query = supabase
    .from("exercise_templates")
    .select("*")
    .eq("body_part", questionnaire.bodyPart)

  // 통증 레벨 필터링 (통증이 높으면 낮은 레벨 운동만)
  if (questionnaire.painLevel >= 4) {
    query = query.lte("pain_level", 2)
  } else if (questionnaire.painLevel >= 3) {
    query = query.lte("pain_level", 3)
  }

  // 기구 필터링
  if (questionnaire.equipmentTypes.length > 0) {
    query = query.contains("equipment_types", questionnaire.equipmentTypes)
  }

  // 경험 수준 필터링
  if (questionnaire.experienceLevel === "거의 안 함") {
    query = query.eq("experience_level", "초보")
  } else if (questionnaire.experienceLevel === "주 1-2회") {
    query = query.in("experience_level", ["초보", "중급"])
  }

  const { data: templates, error: templateError } = await query

  if (templateError) {
    return { error: templateError.message }
  }

  if (!templates || templates.length === 0) {
    return { error: "조건에 맞는 운동 템플릿을 찾을 수 없습니다." }
  }

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

  // 준비운동 (스트레칭 위주)
  const warmupTemplates = templates
    .filter((t) => t.duration_minutes <= 10)
    .slice(0, 3)
  warmupTemplates.forEach((template, index) => {
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

  // 메인 운동
  const mainTemplates = templates
    .filter((t) => t.duration_minutes >= 10)
    .slice(0, Math.floor(mainDuration / 15)) // 15분당 1개 운동
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
    mainTime += template.duration_minutes
  })

  // 마무리 스트레칭
  const cooldownTemplates = templates
    .filter((t) => t.duration_minutes <= 10)
    .slice(0, 2)
  cooldownTemplates.forEach((template, index) => {
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
  const { data: courseWithExercises } = await supabase
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

  revalidatePath("/course")
  return { success: true, data: courseWithExercises }
}

