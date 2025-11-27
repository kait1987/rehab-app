"use server"

import { createClient } from "@/lib/supabase/server"

export async function getHospitalByCode(code: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .eq("code", code)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function linkPatientToTherapist(patientId: string, hospitalCode: string) {
  const supabase = await createClient()

  // 병원 코드로 병원 찾기
  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("*")
    .eq("code", hospitalCode)
    .single()

  if (hospitalError || !hospital) {
    return { error: "유효하지 않은 병원 코드입니다." }
  }

  // 해당 병원의 치료사 찾기 (첫 번째 치료사 또는 특정 로직에 따라)
  const { data: therapists, error: therapistError } = await supabase
    .from("therapists")
    .select("*")
    .eq("hospital_id", hospital.id)
    .limit(1)

  if (therapistError) {
    return { error: therapistError.message }
  }

  if (!therapists || therapists.length === 0) {
    return { error: "해당 병원에 등록된 치료사가 없습니다." }
  }

  const therapistId = therapists[0].id

  // 환자 정보 업데이트
  const { error: updateError } = await supabase
    .from("patients")
    .update({
      therapist_id: therapistId,
      hospital_code: hospitalCode,
    })
    .eq("id", patientId)

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true, therapistId }
}

export async function getTherapistByHospitalCode(hospitalCode: string) {
  const supabase = await createClient()

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("*")
    .eq("code", hospitalCode)
    .single()

  if (hospitalError || !hospital) {
    return { error: "유효하지 않은 병원 코드입니다." }
  }

  const { data: therapists, error: therapistError } = await supabase
    .from("therapists")
    .select(`
      *,
      profiles (*)
    `)
    .eq("hospital_id", hospital.id)

  if (therapistError) {
    return { error: therapistError.message }
  }

  return { data: therapists }
}

