"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createProgram(formData: {
  patientId: string
  name: string
  startDate: string
  endDate?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  // 치료사 확인
  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!therapist) {
    return { error: "치료사 권한이 필요합니다." }
  }

  // 프로그램 생성
  const { data: program, error: programError } = await supabase
    .from("programs")
    .insert({
      therapist_id: user.id,
      patient_id: formData.patientId,
      name: formData.name,
      start_date: formData.startDate,
      end_date: formData.endDate || null,
      status: "active",
    })
    .select()
    .single()

  if (programError) {
    return { error: programError.message }
  }

  revalidatePath("/therapist/programs")
  revalidatePath("/therapist/dashboard")
  return { success: true, data: program }
}

export async function updateProgram(programId: string, formData: {
  name?: string
  startDate?: string
  endDate?: string
  status?: "active" | "completed" | "paused"
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  // 프로그램 소유권 확인
  const { data: program } = await supabase
    .from("programs")
    .select("therapist_id")
    .eq("id", programId)
    .single()

  if (!program || program.therapist_id !== user.id) {
    return { error: "권한이 없습니다." }
  }

  const updateData: any = {}
  if (formData.name) updateData.name = formData.name
  if (formData.startDate) updateData.start_date = formData.startDate
  if (formData.endDate !== undefined) updateData.end_date = formData.endDate || null
  if (formData.status) updateData.status = formData.status

  const { data, error } = await supabase
    .from("programs")
    .update(updateData)
    .eq("id", programId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/therapist/programs")
  revalidatePath("/therapist/dashboard")
  return { success: true, data }
}

export async function deleteProgram(programId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  // 프로그램 소유권 확인
  const { data: program } = await supabase
    .from("programs")
    .select("therapist_id")
    .eq("id", programId)
    .single()

  if (!program || program.therapist_id !== user.id) {
    return { error: "권한이 없습니다." }
  }

  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", programId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/therapist/programs")
  revalidatePath("/therapist/dashboard")
  return { success: true }
}

export async function addExerciseToProgram(formData: {
  programId: string
  exerciseTemplateId: string
  dayOfWeek: number[]
  sets: number
  reps: number
  restSeconds?: number
  orderIndex: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  // 프로그램 소유권 확인
  const { data: program } = await supabase
    .from("programs")
    .select("therapist_id")
    .eq("id", formData.programId)
    .single()

  if (!program || program.therapist_id !== user.id) {
    return { error: "권한이 없습니다." }
  }

  const { data, error } = await supabase
    .from("program_exercises")
    .insert({
      program_id: formData.programId,
      exercise_template_id: formData.exerciseTemplateId,
      day_of_week: formData.dayOfWeek,
      sets: formData.sets,
      reps: formData.reps,
      rest_seconds: formData.restSeconds || null,
      order_index: formData.orderIndex,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/therapist/programs")
  return { success: true, data }
}

export async function removeExerciseFromProgram(programExerciseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  // 프로그램 소유권 확인
  const { data: programExercise } = await supabase
    .from("program_exercises")
    .select(`
      *,
      programs!inner(therapist_id)
    `)
    .eq("id", programExerciseId)
    .single()

  if (!programExercise || (programExercise.programs as any).therapist_id !== user.id) {
    return { error: "권한이 없습니다." }
  }

  const { error } = await supabase
    .from("program_exercises")
    .delete()
    .eq("id", programExerciseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/therapist/programs")
  return { success: true }
}

export async function getPrograms(patientId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  let query = supabase
    .from("programs")
    .select(`
      *,
      patients!inner(
        *,
        profiles (*)
      ),
      program_exercises (
        *,
        exercise_templates (*)
      )
    `)

  // 치료사인 경우 자신의 프로그램만
  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("id", user.id)
    .single()

  if (therapist) {
    query = query.eq("therapist_id", user.id)
    if (patientId) {
      query = query.eq("patient_id", patientId)
    }
  } else {
    // 환자인 경우 자신의 프로그램만
    query = query.eq("patient_id", user.id)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

