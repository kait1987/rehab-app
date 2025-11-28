import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Calendar, TrendingUp, Activity } from "lucide-react"
import { getExerciseLogs } from "@/actions/exercise"
import { ProgressCalendar } from "./ProgressCalendar"
import { ProgressStats } from "./ProgressStats"

export default async function ProgressPage() {
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

  // 최근 30일 기록 가져오기
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const startDate = thirtyDaysAgo.toISOString().split("T")[0]

  const logsResult = await getExerciseLogs(user.id, startDate)

  if (logsResult.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">기록을 불러올 수 없습니다.</p>
            <Button asChild>
              <Link href="/patient/dashboard">대시보드로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const logs = logsResult.data || []

  // 활성 프로그램 가져오기
  const { data: programs } = await supabase
    .from("programs")
    .select(`
      *,
      program_exercises (
        id,
        day_of_week,
        sets,
        exercise_templates (*)
      )
    `)
    .eq("patient_id", user.id)
    .eq("status", "active")

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
          <h1 className="text-2xl font-bold text-blue-600">진행 현황</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* 통계 카드 */}
          <ProgressStats logs={logs} programs={programs || []} />

          {/* 캘린더 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                운동 완료 캘린더
              </CardTitle>
              <CardDescription>
                최근 30일간의 운동 수행 기록을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressCalendar logs={logs} />
            </CardContent>
          </Card>

          {/* 최근 기록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                최근 운동 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  아직 운동 기록이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 10).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {log.program_exercises?.exercise_templates?.name || "운동"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(log.exercise_date).toLocaleDateString("ko-KR")} ·{" "}
                          {log.sets_completed}세트 완료
                        </p>
                        {log.pain_level && (
                          <p className="text-xs text-gray-500 mt-1">
                            통증: {log.pain_level}/5 · 난이도: {log.difficulty_level || "-"}/5
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

