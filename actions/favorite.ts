"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleFavorite(formData: {
  gymId: string
  userId: string
}) {
  const supabase = await createClient()

  // 기존 즐겨찾기 확인
  const { data: existing } = await supabase
    .from("favorites")
    .select("*")
    .eq("gym_id", formData.gymId)
    .eq("user_id", formData.userId)
    .single()

  if (existing) {
    // 삭제
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("gym_id", formData.gymId)
      .eq("user_id", formData.userId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/gym/${formData.gymId}`)
    return { success: true, isFavorite: false }
  } else {
    // 추가
    const { error } = await supabase.from("favorites").insert({
      gym_id: formData.gymId,
      user_id: formData.userId,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/gym/${formData.gymId}`)
    return { success: true, isFavorite: true }
  }
}

