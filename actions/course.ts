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

  // 최근 5개 코스 조회 (중복 방지용)
  let recentlyUsedTemplateIds = new Set<string>()
  if (user?.id) {
    try {
      const { data: recentCourses, error: historyError } = await supabase
        .from("user_courses")
        .select(`
          id,
          created_at,
          course_exercises (
            exercise_template_id
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (historyError) {
        console.warn('최근 코스 조회 실패 (무시됨):', historyError.message)
      } else if (recentCourses && recentCourses.length > 0) {
        recentCourses.forEach(course => {
          if (course.course_exercises) {
            course.course_exercises.forEach((ex: any) => {
              if (ex.exercise_template_id) {
                recentlyUsedTemplateIds.add(ex.exercise_template_id)
              }
            })
          }
        })
        console.log(`최근 ${recentCourses.length}개 코스에서 사용된 운동 ${recentlyUsedTemplateIds.size}개 식별됨`)
      }
    } catch (err) {
      console.warn('최근 코스 조회 중 예외 발생 (무시됨):', err)
    }
  }

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

  // 스트레칭 운동 부족 시 자동 크롤링 트리거 (마무리 운동용)
  const stretchingKeywords = ['스트레칭', '이완', '마사지', '풀기', '호흡', '요가', 'Stretching', 'Yoga', 'Pose', 'Stretch']
  const stretchingExercises = templates?.filter((t: any) => 
    stretchingKeywords.some(k => t.name.includes(k)) || 
    t.name.includes('자세') || // 요가 자세 등
    t.description?.includes('스트레칭') ||
    t.description?.includes('이완')
  ) || []

  // 스트레칭 운동이 부족하면 즉시 크롤러 실행 후 대기
  if (stretchingExercises.length < 5) {
    console.log('스트레칭 운동 부족으로 자동 추가 시도 (강력 모드):', { count: stretchingExercises.length })
    const { autoAddExerciseTemplates } = await import('./exercise-crawler')
    await autoAddExerciseTemplates(questionnaire.bodyPart, questionnaire.painLevel)
    
    // 다시 조회 (크롤링 후 데이터 반영)
    const result = await query
    if (result.data && result.data.length > 0) {
      templates = result.data
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

  // 운동 배정 - 절대 중복 없음 보장
  const exercises: any[] = []
  
  // 전체 사용된 운동 추적 (세션 간 중복 방지)
  const allUsedTemplateIds = new Set<string>()
  const allUsedExerciseNames = new Set<string>()
  
  // 세션별 사용된 운동 추적 (세션 내 중복 방지)
  const warmupUsedIds = new Set<string>()
  const warmupUsedNames = new Set<string>()
  const mainUsedIds = new Set<string>()
  const mainUsedNames = new Set<string>()
  const cooldownUsedIds = new Set<string>()
  const cooldownUsedNames = new Set<string>()

  // 배열 섞기 (다양한 운동 선택)
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // 사용 가능한 템플릿 필터링 (절대 중복 없음 보장 + 최근 사용 운동 후순위 배치)
  const getAvailableTemplates = (excludeIds: Set<string>, excludeNames: Set<string>) => {
    const available = finalTemplates.filter((t) => 
      !allUsedTemplateIds.has(t.id) &&      // 전체에서 사용되지 않음
      !allUsedExerciseNames.has(t.name) &&  // 전체에서 사용되지 않음
      !excludeIds.has(t.id) &&              // 현재 세션에서 사용되지 않음
      !excludeNames.has(t.name)             // 현재 세션에서 사용되지 않음
    )

    // 우선순위 정렬: 최근에 사용되지 않은 운동을 앞으로
    return available.sort((a, b) => {
      const aUsed = recentlyUsedTemplateIds.has(a.id)
      const bUsed = recentlyUsedTemplateIds.has(b.id)
      
      if (aUsed && !bUsed) return 1  // a는 사용됨, b는 안됨 -> b 우선
      if (!aUsed && bUsed) return -1 // a는 안됨, b는 사용됨 -> a 우선
      return 0 // 둘 다 같음 (랜덤 셔플은 호출 측에서 처리)
    })
  }

  // 운동 추가 함수 (중복 체크 후 추가)
  const addExercise = (
    template: any,
    section: 'warmup' | 'main' | 'cooldown',
    sessionUsedIds: Set<string>,
    sessionUsedNames: Set<string>,
    index: number
  ) => {
    // 최종 중복 체크
    if (allUsedTemplateIds.has(template.id) || allUsedExerciseNames.has(template.name)) {
      console.warn(`⚠️ 중복 방지: ${template.name}은 이미 사용되었습니다.`)
      return false
    }
    if (sessionUsedIds.has(template.id) || sessionUsedNames.has(template.name)) {
      console.warn(`⚠️ 세션 내 중복 방지: ${template.name}은 이미 이 세션에서 사용되었습니다.`)
      return false
    }

    // 전체 추적에 추가
    allUsedTemplateIds.add(template.id)
    allUsedExerciseNames.add(template.name)
    
    // 세션별 추적에 추가
    sessionUsedIds.add(template.id)
    sessionUsedNames.add(template.name)

    // 운동 추가
    const exerciseData: any = {
      course_id: course.id,
      exercise_template_id: template.id,
      exercise_name: template.name,
      section: section,
      duration_seconds: template.duration_minutes * 60,
      order_index: index,
    }

    if (section === 'main') {
      exerciseData.sets = 3
      exerciseData.reps = 10
      exerciseData.rest_seconds = 60
    }

    exercises.push(exerciseData)
    return true
  }

  // ========== 준비운동 세션 선택 ==========
  // 준비운동: 스트레칭 위주, 짧은 시간 운동
  let remainingTime = warmupDuration
  const warmupTemplates: any[] = []
  
  console.log('준비운동 선택 시작:', {
    warmupDuration,
    availableCount: getAvailableTemplates(warmupUsedIds, warmupUsedNames).length
  })

  // 단계별로 준비운동 후보 확보 (점진적 필터 완화)
  let warmupCandidates: any[] = []
  
  // 1단계: 이상적인 준비운동 (15분 이하)
  let idealWarmup = getAvailableTemplates(warmupUsedIds, warmupUsedNames)
    .filter((t) => t.duration_minutes <= 15)
  
  if (idealWarmup.length > 0) {
    console.log(`1단계: 이상적인 준비운동 ${idealWarmup.length}개 발견`)
    warmupCandidates = [...idealWarmup]
  } else {
    // 2단계: 시간 조건 완화 (20분 이하)
    let relaxedWarmup = getAvailableTemplates(warmupUsedIds, warmupUsedNames)
      .filter((t) => t.duration_minutes <= 20)
    
    if (relaxedWarmup.length > 0) {
      console.log(`2단계: 시간 조건 완화 - ${relaxedWarmup.length}개 발견`)
      warmupCandidates = [...relaxedWarmup]
    } else {
      // 3단계: 모든 사용 가능한 운동 (시간 제한 없음)
      let allAvailable = getAvailableTemplates(warmupUsedIds, warmupUsedNames)
      console.log(`3단계: 모든 사용 가능한 운동 - ${allAvailable.length}개 발견`)
      warmupCandidates = [...allAvailable]
    }
  }
  
  // 신선한 운동과 최근 운동 분리
  const freshWarmup = warmupCandidates.filter(t => !recentlyUsedTemplateIds.has(t.id))
  const recentWarmup = warmupCandidates.filter(t => recentlyUsedTemplateIds.has(t.id))
  
  // 각각 섞기
  warmupCandidates = [
    ...shuffleArray(freshWarmup),
    ...shuffleArray(recentWarmup)
  ]

  // 준비운동 선택: 시간에 맞춰서, 최소 2개는 반드시 보장
  let warmupSelectedCount = 0
  for (const template of warmupCandidates) {
    // 최대 5개까지 선택 가능
    if (warmupSelectedCount >= 5) break
    
    // 중복 체크 (이중 확인)
    if (allUsedTemplateIds.has(template.id) || allUsedExerciseNames.has(template.name)) {
      continue // 이미 다른 세션에서 사용됨
    }
    if (warmupUsedIds.has(template.id) || warmupUsedNames.has(template.name)) {
      continue // 이미 이 세션에서 사용됨
    }
    
    // 시간 체크: 시간이 남았거나 아직 선택된 운동이 2개 미만이면 추가
    const canAdd = remainingTime > 0 || warmupTemplates.length < 2
    
    if (canAdd) {
      if (addExercise(template, 'warmup', warmupUsedIds, warmupUsedNames, warmupTemplates.length)) {
        warmupTemplates.push(template)
        warmupSelectedCount++
        
        // 시간이 남아있으면 시간 차감
        if (remainingTime > 0) {
          remainingTime = Math.max(0, remainingTime - template.duration_minutes)
        }
        
        // 시간이 충분히 채워졌고 최소 2개 이상이면 종료 가능
        if (warmupTemplates.length >= 2 && remainingTime <= 0) {
          break
        }
      }
    }
  }

  // 최소 2개는 반드시 보장 (시간과 관계없이)
  if (warmupTemplates.length < 2) {
    console.warn('⚠️ 준비운동이 부족하여 강제로 추가 시도')
    
    const allAvailable = getAvailableTemplates(warmupUsedIds, warmupUsedNames)
    const fallbackCandidates = shuffleArray(allAvailable)
    
    for (const template of fallbackCandidates) {
      if (warmupTemplates.length >= 2) break
      
      // 중복 체크
      if (allUsedTemplateIds.has(template.id) || allUsedExerciseNames.has(template.name)) {
        continue
      }
      if (warmupUsedIds.has(template.id) || warmupUsedNames.has(template.name)) {
        continue
      }
      
      if (addExercise(template, 'warmup', warmupUsedIds, warmupUsedNames, warmupTemplates.length)) {
        warmupTemplates.push(template)
        console.log(`✅ 준비운동 강제 추가: ${template.name}`)
      }
    }
  }

  console.log('✅ 준비운동 선택 완료:', {
    count: warmupTemplates.length,
    names: warmupTemplates.map(t => t.name),
    totalTime: warmupTemplates.reduce((sum, t) => sum + t.duration_minutes, 0)
  })

  const actualWarmupTime = warmupTemplates.reduce((sum, t) => sum + t.duration_minutes, 0)

  // ========== 메인 운동 세션 선택 ==========
  // 메인 운동: 강도 높은 운동, 준비운동과 절대 중복 없음
  remainingTime = mainDuration
  const mainTemplates: any[] = []
  
  console.log('메인 운동 선택 시작:', {
    mainDuration,
    availableCount: getAvailableTemplates(mainUsedIds, mainUsedNames).length,
    usedInWarmup: allUsedTemplateIds.size
  })

  // 단계별로 메인 운동 후보 확보 (점진적 필터 완화)
  let mainCandidates: any[] = []
  
  // 1단계: 이상적인 메인 운동 (5분 이상, 강도 높은 운동)
  let idealMain = getAvailableTemplates(mainUsedIds, mainUsedNames)
    .filter((t) => t.duration_minutes >= 5)
  
  if (idealMain.length > 0) {
    console.log(`1단계: 이상적인 메인 운동 ${idealMain.length}개 발견`)
    mainCandidates = [...idealMain]
  } else {
    // 2단계: 시간 조건 완화 (3분 이상)
    let relaxedMain = getAvailableTemplates(mainUsedIds, mainUsedNames)
      .filter((t) => t.duration_minutes >= 3)
    
    if (relaxedMain.length > 0) {
      console.log(`2단계: 시간 조건 완화 - ${relaxedMain.length}개 발견`)
      mainCandidates = [...relaxedMain]
    } else {
      // 3단계: 시간 조건 더 완화 (1분 이상)
      let veryRelaxedMain = getAvailableTemplates(mainUsedIds, mainUsedNames)
        .filter((t) => t.duration_minutes >= 1)
      
      if (veryRelaxedMain.length > 0) {
        console.log(`3단계: 시간 조건 더 완화 - ${veryRelaxedMain.length}개 발견`)
        mainCandidates = [...veryRelaxedMain]
      } else {
        // 4단계: 모든 사용 가능한 운동 (시간 제한 없음)
        let allAvailable = getAvailableTemplates(mainUsedIds, mainUsedNames)
        console.log(`4단계: 모든 사용 가능한 운동 - ${allAvailable.length}개 발견`)
        mainCandidates = [...allAvailable]
      }
    }
  }

  // 신선한 운동과 최근 운동 분리
  const freshMain = mainCandidates.filter(t => !recentlyUsedTemplateIds.has(t.id))
  const recentMain = mainCandidates.filter(t => recentlyUsedTemplateIds.has(t.id))
  
  // 각각 섞어서 합치기 (신선한 것 우선)
  mainCandidates = [
    ...shuffleArray(freshMain),
    ...shuffleArray(recentMain)
  ]

  console.log('메인 운동 후보 준비 완료:', {
    total: mainCandidates.length,
    fresh: freshMain.length,
    recent: recentMain.length
  })

  // 메인 운동 선택: 시간에 맞춰서 선택, 최소 1개는 반드시 보장
  let mainSelectedCount = 0
  for (const template of mainCandidates) {
    // 최대 10개까지 선택 가능
    if (mainSelectedCount >= 10) break
    
    // 중복 체크 (이중 확인)
    if (allUsedTemplateIds.has(template.id) || allUsedExerciseNames.has(template.name)) {
      continue // 이미 다른 세션에서 사용됨
    }
    if (mainUsedIds.has(template.id) || mainUsedNames.has(template.name)) {
      continue // 이미 이 세션에서 사용됨
    }
    
    // 시간 체크: 시간이 남았거나 아직 선택된 운동이 없으면 추가
    const canAdd = remainingTime > 0 || mainTemplates.length === 0
    
    if (canAdd) {
      if (addExercise(template, 'main', mainUsedIds, mainUsedNames, mainTemplates.length)) {
        mainTemplates.push(template)
        mainSelectedCount++
        
        // 시간이 남아있으면 시간 차감
        if (remainingTime > 0) {
          remainingTime = Math.max(0, remainingTime - template.duration_minutes)
        }
        
        // 시간이 충분히 채워졌고 최소 1개 이상이면 종료 가능
        if (mainTemplates.length >= 1 && remainingTime <= 0) {
          // 하지만 최소 2-3개는 확보하려고 시도
          if (mainTemplates.length < 2 && mainCandidates.length > mainSelectedCount) {
            continue // 더 선택 시도
          }
          break
        }
      }
    }
  }

  // 최소 1개는 반드시 보장 (시간과 관계없이)
  if (mainTemplates.length === 0) {
    console.warn('⚠️ 메인 운동이 선택되지 않아 강제로 추가 시도')
    
    // 모든 사용 가능한 운동에서 찾기 (필터 없이)
    const allAvailable = getAvailableTemplates(mainUsedIds, mainUsedNames)
    const fallbackCandidates = shuffleArray(allAvailable)
    
    for (const template of fallbackCandidates) {
      if (mainTemplates.length >= 1) break
      
      // 중복 체크
      if (allUsedTemplateIds.has(template.id) || allUsedExerciseNames.has(template.name)) {
        continue
      }
      if (mainUsedIds.has(template.id) || mainUsedNames.has(template.name)) {
        continue
      }
      
      if (addExercise(template, 'main', mainUsedIds, mainUsedNames, 0)) {
        mainTemplates.push(template)
        console.log(`✅ 메인 운동 강제 추가: ${template.name}`)
        break
      }
    }
  }

  // 여전히 메인 운동이 없으면 에러 로그
  if (mainTemplates.length === 0) {
    console.error('❌ 메인 운동을 선택할 수 없습니다!', {
      availableTemplates: finalTemplates.length,
      usedInWarmup: allUsedTemplateIds.size,
      warmupCount: warmupTemplates.length,
      remainingAvailable: getAvailableTemplates(mainUsedIds, mainUsedNames).length
    })
  } else {
    console.log('✅ 메인 운동 선택 완료:', {
      count: mainTemplates.length,
      names: mainTemplates.map(t => t.name),
      totalTime: mainTemplates.reduce((sum, t) => sum + t.duration_minutes, 0)
    })
  }

  const actualMainTime = mainTemplates.reduce((sum, t) => sum + t.duration_minutes, 0)

  // ========== 마무리 운동 세션 선택 ==========
  // 마무리 운동: 스트레칭, 준비운동과 메인 운동과 절대 중복 없음
  remainingTime = cooldownDuration
  const cooldownTemplates: any[] = []
  
  console.log('마무리 운동 선택 시작:', {
    cooldownDuration,
    availableCount: getAvailableTemplates(cooldownUsedIds, cooldownUsedNames).length,
    usedInWarmupAndMain: allUsedTemplateIds.size
  })

  // 단계별로 마무리 운동 후보 확보 (점진적 필터 완화)
  let cooldownCandidates: any[] = []
  
  // 1단계: 이상적인 마무리 운동 (스트레칭 키워드 포함, 15분 이하)
  let idealCooldown = getAvailableTemplates(cooldownUsedIds, cooldownUsedNames)
    .filter((t) => {
      const isStretching = stretchingKeywords.some(k => t.name.includes(k)) || 
                           t.name.includes('자세') || 
                           t.description?.includes('스트레칭') ||
                           t.description?.includes('이완')
      return isStretching && t.duration_minutes <= 15
    })
  
  if (idealCooldown.length > 0) {
    console.log(`1단계: 이상적인 마무리 운동 ${idealCooldown.length}개 발견`)
    cooldownCandidates = [...idealCooldown]
  } else {
    // 2단계: 스트레칭 키워드만 (시간 제한 완화)
    let relaxedCooldown = getAvailableTemplates(cooldownUsedIds, cooldownUsedNames)
      .filter((t) => {
        const isStretching = stretchingKeywords.some(k => t.name.includes(k)) || 
                             t.name.includes('자세') || 
                             t.description?.includes('스트레칭') ||
                             t.description?.includes('이완')
        return isStretching
      })
    
    if (relaxedCooldown.length > 0) {
      console.log(`2단계: 스트레칭 키워드만 - ${relaxedCooldown.length}개 발견`)
      cooldownCandidates = [...relaxedCooldown]
    } else {
      // 3단계: 저강도 운동 (pain_level <= 1 또는 duration <= 5)
      let lowIntensityCooldown = getAvailableTemplates(cooldownUsedIds, cooldownUsedNames)
        .filter(t => t.pain_level <= 1 || t.duration_minutes <= 5)
      
      if (lowIntensityCooldown.length > 0) {
        console.log(`3단계: 저강도 운동 - ${lowIntensityCooldown.length}개 발견`)
        cooldownCandidates = [...lowIntensityCooldown]
      } else {
        // 4단계: 모든 사용 가능한 운동 (시간 제한 없음)
        let allAvailable = getAvailableTemplates(cooldownUsedIds, cooldownUsedNames)
        console.log(`4단계: 모든 사용 가능한 운동 - ${allAvailable.length}개 발견`)
        cooldownCandidates = [...allAvailable]
      }
    }
  }

  // 신선한 운동과 최근 운동 분리
  const freshCooldown = cooldownCandidates.filter(t => !recentlyUsedTemplateIds.has(t.id))
  const recentCooldown = cooldownCandidates.filter(t => recentlyUsedTemplateIds.has(t.id))
  
  // 각각 섞어서 합치기
  cooldownCandidates = [
    ...shuffleArray(freshCooldown),
    ...shuffleArray(recentCooldown)
  ]

  // 마무리 운동 선택: 시간에 맞춰서, 최소 2개는 반드시 보장
  let cooldownSelectedCount = 0
  for (const template of cooldownCandidates) {
    // 최대 5개까지 선택 가능
    if (cooldownSelectedCount >= 5) break
    
    // 중복 체크 (이중 확인)
    if (allUsedTemplateIds.has(template.id) || allUsedExerciseNames.has(template.name)) {
      continue // 이미 다른 세션에서 사용됨
    }
    if (cooldownUsedIds.has(template.id) || cooldownUsedNames.has(template.name)) {
      continue // 이미 이 세션에서 사용됨
    }
    
    // 시간 체크: 시간이 남았거나 아직 선택된 운동이 2개 미만이면 추가
    const canAdd = remainingTime > 0 || cooldownTemplates.length < 2
    
    if (canAdd) {
      if (addExercise(template, 'cooldown', cooldownUsedIds, cooldownUsedNames, cooldownTemplates.length)) {
        cooldownTemplates.push(template)
        cooldownSelectedCount++
        
        // 시간이 남아있으면 시간 차감
        if (remainingTime > 0) {
          remainingTime = Math.max(0, remainingTime - template.duration_minutes)
        }
        
        // 시간이 충분히 채워졌고 최소 2개 이상이면 종료 가능
        if (cooldownTemplates.length >= 2 && remainingTime <= 0) {
          break
        }
      }
    }
  }

  // 최소 2개는 반드시 보장 (시간과 관계없이)
  if (cooldownTemplates.length < 2) {
    console.warn('⚠️ 마무리 운동이 부족하여 강제로 추가 시도')
    
    const allAvailable = getAvailableTemplates(cooldownUsedIds, cooldownUsedNames)
    const fallbackCandidates = shuffleArray(allAvailable)
    
    for (const template of fallbackCandidates) {
      if (cooldownTemplates.length >= 2) break
      
      // 중복 체크
      if (allUsedTemplateIds.has(template.id) || allUsedExerciseNames.has(template.name)) {
        continue
      }
      if (cooldownUsedIds.has(template.id) || cooldownUsedNames.has(template.name)) {
        continue
      }
      
      if (addExercise(template, 'cooldown', cooldownUsedIds, cooldownUsedNames, cooldownTemplates.length)) {
        cooldownTemplates.push(template)
        console.log(`✅ 마무리 운동 강제 추가: ${template.name}`)
      }
    }
  }

  console.log('✅ 마무리 운동 선택 완료:', {
    count: cooldownTemplates.length,
    names: cooldownTemplates.map(t => t.name),
    totalTime: cooldownTemplates.reduce((sum, t) => sum + t.duration_minutes, 0)
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
    uniqueExercises: allUsedTemplateIds.size
  })
  
  // 검증: 마무리 운동이 반드시 있어야 함
  if (cooldownTemplates.length === 0) {
    console.error('마무리 운동이 생성되지 않았습니다!')
    // 강제로 마무리 운동 추가
    const anyRemaining = finalTemplates
      .filter((t) => !allUsedTemplateIds.has(t.id))
      .slice(0, 2)
    if (anyRemaining.length > 0) {
      anyRemaining.forEach((template, index) => {
        allUsedTemplateIds.add(template.id)
        allUsedExerciseNames.add(template.name)
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
  
  // ========== 최종 검증: 절대 중복 없음 확인 ==========
  const exerciseNames = exercises.map(e => e.exercise_name)
  const exerciseIds = exercises.map(e => e.exercise_template_id)
  const uniqueNames = new Set(exerciseNames)
  const uniqueIds = new Set(exerciseIds)
  
  // 세션별 운동 추출
  const warmupExercises = exercises.filter(e => e.section === 'warmup')
  const mainExercises = exercises.filter(e => e.section === 'main')
  const cooldownExercises = exercises.filter(e => e.section === 'cooldown')
  
  const warmupNames = warmupExercises.map(e => e.exercise_name)
  const mainNames = mainExercises.map(e => e.exercise_name)
  const cooldownNames = cooldownExercises.map(e => e.exercise_name)
  
  const warmupIds = warmupExercises.map(e => e.exercise_template_id)
  const mainIds = mainExercises.map(e => e.exercise_template_id)
  const cooldownIds = cooldownExercises.map(e => e.exercise_template_id)
  
  // 세션별 고유성 확인
  const warmupUniqueNames = new Set(warmupNames)
  const warmupUniqueIds = new Set(warmupIds)
  const mainUniqueNames = new Set(mainNames)
  const mainUniqueIds = new Set(mainIds)
  const cooldownUniqueNames = new Set(cooldownNames)
  const cooldownUniqueIds = new Set(cooldownIds)
  
  // 검증 결과
  let hasError = false
  
  // 1. 전체 중복 확인
  if (exerciseNames.length !== uniqueNames.size || exerciseIds.length !== uniqueIds.size) {
    console.error('❌ 전체 중복된 운동이 발견되었습니다!', {
      total: exerciseNames.length,
      uniqueNames: uniqueNames.size,
      uniqueIds: uniqueIds.size,
      duplicateNames: exerciseNames.filter((name, index) => exerciseNames.indexOf(name) !== index),
      duplicateIds: exerciseIds.filter((id, index) => exerciseIds.indexOf(id) !== index)
    })
    hasError = true
  }
  
  // 2. 세션 내 중복 확인
  if (warmupNames.length !== warmupUniqueNames.size || warmupIds.length !== warmupUniqueIds.size) {
    console.error('❌ 준비운동 세션 내 중복 발견!', {
      total: warmupNames.length,
      uniqueNames: warmupUniqueNames.size,
      uniqueIds: warmupUniqueIds.size,
      duplicates: warmupNames.filter((name, index) => warmupNames.indexOf(name) !== index)
    })
    hasError = true
  }
  
  if (mainNames.length !== mainUniqueNames.size || mainIds.length !== mainUniqueIds.size) {
    console.error('❌ 메인 운동 세션 내 중복 발견!', {
      total: mainNames.length,
      uniqueNames: mainUniqueNames.size,
      uniqueIds: mainUniqueIds.size,
      duplicates: mainNames.filter((name, index) => mainNames.indexOf(name) !== index)
    })
    hasError = true
  }
  
  if (cooldownNames.length !== cooldownUniqueNames.size || cooldownIds.length !== cooldownUniqueIds.size) {
    console.error('❌ 마무리 운동 세션 내 중복 발견!', {
      total: cooldownNames.length,
      uniqueNames: cooldownUniqueNames.size,
      uniqueIds: cooldownUniqueIds.size,
      duplicates: cooldownNames.filter((name, index) => cooldownNames.indexOf(name) !== index)
    })
    hasError = true
  }
  
  // 3. 세션 간 중복 확인
  const warmupInMain = warmupNames.filter(name => mainNames.includes(name))
  const warmupInCooldown = warmupNames.filter(name => cooldownNames.includes(name))
  const mainInCooldown = mainNames.filter(name => cooldownNames.includes(name))
  
  const warmupIdsInMain = warmupIds.filter(id => mainIds.includes(id))
  const warmupIdsInCooldown = warmupIds.filter(id => cooldownIds.includes(id))
  const mainIdsInCooldown = mainIds.filter(id => cooldownIds.includes(id))
  
  if (warmupInMain.length > 0 || warmupIdsInMain.length > 0) {
    console.error('❌ 준비운동이 메인 운동에 중복!', {
      names: warmupInMain,
      ids: warmupIdsInMain
    })
    hasError = true
  }
  
  if (warmupInCooldown.length > 0 || warmupIdsInCooldown.length > 0) {
    console.error('❌ 준비운동이 마무리 운동에 중복!', {
      names: warmupInCooldown,
      ids: warmupIdsInCooldown
    })
    hasError = true
  }
  
  if (mainInCooldown.length > 0 || mainIdsInCooldown.length > 0) {
    console.error('❌ 메인 운동이 마무리 운동에 중복!', {
      names: mainInCooldown,
      ids: mainIdsInCooldown
    })
    hasError = true
  }
  
  // 성공 로그
  if (!hasError) {
    console.log('✅ 모든 세션에서 절대 중복 없음 확인!', {
      준비운동: warmupNames,
      메인운동: mainNames,
      마무리운동: cooldownNames,
      총운동수: exercises.length,
      고유운동수: uniqueNames.size
    })
  } else {
    console.error('🚨 중복 오류가 발견되었습니다. 운동 배정을 다시 확인하세요!')
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

