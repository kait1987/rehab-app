import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Play, CheckCircle2 } from "lucide-react"
import { ExerciseLogForm } from "./ExerciseLogForm"

export default async function ExercisePage({
  params,
}: {
  params: { id: string }
}) {
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

  if (!profile || profile.role !== "patient") {
    redirect("/login")
  }

  // 프로그램 운동 정보 가져오기
  const { data: programExercise, error } = await supabase
    .from("program_exercises")
    .select(`
      *,
      exercise_templates (*),
      programs!inner (
        *,
        patients!inner (
          id
        )
      )
    `)
    .eq("id", params.id)
    .eq("programs.patients.id", user.id)
    .single()

  if (error || !programExercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">운동을 찾을 수 없습니다.</p>
            <Button asChild>
              <Link href="/patient/dashboard">대시보드로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const exercise = programExercise.exercise_templates as any
  const today = new Date().toISOString().split("T")[0]

  // 오늘의 기록 가져오기
  const { data: todayLog } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("patient_id", user.id)
    .eq("program_exercise_id", params.id)
    .eq("exercise_date", today)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/patient/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-blue-600">운동 수행</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {exercise.name}
            </CardTitle>
            <CardDescription>{exercise.body_part} 재활 운동</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exercise.description && (
              <div>
                <h3 className="font-semibold mb-2">운동 설명</h3>
                <p className="text-gray-700">{exercise.description}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">세트</p>
                <p className="text-2xl font-bold text-blue-600">
                  {programExercise.sets}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">반복</p>
                <p className="text-2xl font-bold text-green-600">
                  {programExercise.reps}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">휴식</p>
                <p className="text-2xl font-bold text-purple-600">
                  {programExercise.rest_seconds || 0}초
                </p>
              </div>
            </div>

            {exercise.precautions && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">주의사항</h3>
                <p className="text-yellow-700 text-sm">{exercise.precautions}</p>
              </div>
            )}

            {exercise.video_url && (
              <div>
                <h3 className="font-semibold mb-2">운동 영상</h3>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <video
                    src={exercise.video_url}
                    controls
                    className="w-full h-full rounded-lg"
                  >
                    비디오를 재생할 수 없습니다.
                  </video>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              운동 기록
            </CardTitle>
            <CardDescription>
              운동을 완료한 후 기록을 남겨주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseLogForm
              programExerciseId={params.id}
              patientId={user.id}
              defaultSets={programExercise.sets}
              todayLog={todayLog}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

