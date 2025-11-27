import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Activity, MessageSquare, LogOut } from "lucide-react"
import { signOut } from "@/actions/auth"

export default async function PatientDashboard() {
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

  // 오늘의 운동 프로그램 가져오기
  const today = new Date().toISOString().split("T")[0]
  const dayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay() // 일요일을 7로 변환

  const { data: programs } = await supabase
    .from("programs")
    .select(`
      *,
      program_exercises (
        *,
        exercise_templates (*)
      )
    `)
    .eq("patient_id", user.id)
    .eq("status", "active")

  // 오늘 해야 할 운동 필터링
  const todayExercises = programs?.flatMap((program) =>
    program.program_exercises?.filter((pe: any) =>
      pe.day_of_week?.includes(dayOfWeek)
    ) || []
  ) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">재활운동 관리</h1>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">안녕하세요, {profile.name}님</h2>
          <p className="text-gray-600">오늘도 건강한 회복을 위해 함께해요!</p>
        </div>

        {/* 오늘의 운동 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              오늘의 운동
            </CardTitle>
            <CardDescription>
              {todayExercises.length > 0
                ? `${todayExercises.length}개의 운동을 완료해주세요`
                : "오늘 예정된 운동이 없습니다"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayExercises.length > 0 ? (
              <div className="space-y-3">
                {todayExercises.map((exercise: any) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {exercise.exercise_templates?.name || "운동"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {exercise.sets}세트 × {exercise.reps}회
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={`/exercise/${exercise.id}`}>시작하기</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                오늘 예정된 운동이 없습니다. 치료사에게 문의하세요.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 빠른 메뉴 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                진행 현황
              </CardTitle>
              <CardDescription>운동 수행 기록을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/progress">확인하기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                메시지
              </CardTitle>
              <CardDescription>치료사와 소통하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/messages">메시지 보기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>프로필</CardTitle>
              <CardDescription>내 정보를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>이름:</strong> {profile.name}</p>
                <p><strong>이메일:</strong> {profile.email}</p>
                {profile.phone && (
                  <p><strong>전화번호:</strong> {profile.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

