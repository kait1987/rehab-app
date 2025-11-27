import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateProgramForm } from "./CreateProgramForm"

export default async function NewProgramPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "therapist") {
    redirect("/login")
  }

  // 담당 환자 목록 가져오기
  const { data: patients } = await supabase
    .from("patients")
    .select(`
      *,
      profiles (*)
    `)
    .eq("therapist_id", user.id)

  // 운동 템플릿 목록 가져오기
  const { data: exerciseTemplates } = await supabase
    .from("exercise_templates")
    .select("*")
    .order("body_part")
    .order("name")

  return (
    <CreateProgramForm
      patients={patients || []}
      exerciseTemplates={exerciseTemplates || []}
    />
  )
}

