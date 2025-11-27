"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getReviews(gymId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("gym_id", gymId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

export async function submitReview(formData: {
  gymId: string
  tags: string[]
  comment?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id || `anonymous_${Date.now()}`

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      gym_id: formData.gymId,
      user_id: userId,
      tags: formData.tags,
      comment: formData.comment || null,
      is_admin_review: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/gym/${formData.gymId}`)
  return { success: true, data }
}

