"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveExerciseLog(formData: {
  programExerciseId: string
  patientId: string
  setsCompleted: number
  painLevel?: number
  difficultyLevel?: number
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== formData.patientId) {
    return { error: "권한이 없습니다." }
  }

  const today = new Date().toISOString().split("T")[0]

  // 기존 기록 확인
  const { data: existingLog } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("patient_id", formData.patientId)
    .eq("program_exercise_id", formData.programExerciseId)
    .eq("exercise_date", today)
    .single()

  const logData = {
    patient_id: formData.patientId,
    program_exercise_id: formData.programExerciseId,
    exercise_date: today,
    sets_completed: formData.setsCompleted,
    pain_level: formData.painLevel || null,
    difficulty_level: formData.difficultyLevel || null,
    notes: formData.notes || null,
  }

  let result
  if (existingLog) {
    // 업데이트
    const { data, error } = await supabase
      .from("exercise_logs")
      .update(logData)
      .eq("id", existingLog.id)
      .select()
      .single()

    result = { data, error }
  } else {
    // 생성
    const { data, error } = await supabase
      .from("exercise_logs")
      .insert(logData)
      .select()
      .single()

    result = { data, error }
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/progress")
  return { success: true, data: result.data }
}

export async function getExerciseLogs(patientId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== patientId) {
    return { error: "권한이 없습니다." }
  }

  let query = supabase
    .from("exercise_logs")
    .select(`
      *,
      program_exercises (
        *,
        exercise_templates (*)
      )
    `)
    .eq("patient_id", patientId)
    .order("exercise_date", { ascending: false })

  if (startDate) {
    query = query.gte("exercise_date", startDate)
  }

  if (endDate) {
    query = query.lte("exercise_date", endDate)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

