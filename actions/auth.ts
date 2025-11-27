"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(formData: {
  email: string
  password: string
  name: string
  phone?: string
  role: 'patient' | 'therapist'
  hospitalCode?: string
  hospitalId?: string
  licenseNumber?: string
  diagnosis?: string
  surgeryDate?: string
  birthYear?: number
  gender?: string
}) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        hospital_code: formData.hospitalCode,
        hospital_id: formData.hospitalId,
        license_number: formData.licenseNumber,
        diagnosis: formData.diagnosis,
        surgery_date: formData.surgeryDate,
        birth_year: formData.birthYear,
        gender: formData.gender,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "회원가입에 실패했습니다." }
  }

  // 환자인 경우 병원 코드로 치료사와 연결
  if (formData.role === "patient" && formData.hospitalCode) {
    // 프로필이 생성될 때까지 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { linkPatientToTherapist } = await import("./hospital")
    const linkResult = await linkPatientToTherapist(authData.user.id, formData.hospitalCode)
    
    if (linkResult.error) {
      // 연결 실패해도 회원가입은 성공으로 처리 (나중에 수동 연결 가능)
      console.error("치료사 연결 실패:", linkResult.error)
    }
  }

  revalidatePath("/", "layout")
  return { success: true, user: authData.user }
}

export async function signIn(formData: {
  email: string
  password: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: "로그인에 실패했습니다." }
  }

  // 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  revalidatePath("/", "layout")

  // 환자/치료사 기능 비활성화 - 모든 사용자를 메인 페이지로 리다이렉트
  redirect("/main")

  // 역할에 따라 리다이렉트 (비활성화됨)
  // if (profile?.role === "therapist") {
  //   redirect("/therapist/dashboard")
  // } else {
  //   redirect("/patient/dashboard")
  // }

  return { success: true, user: data.user }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function resetPassword(formData: {
  email: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: {
  password: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return profile
}

