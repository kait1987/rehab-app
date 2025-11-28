import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, MessageSquare, Plus, LogOut } from "lucide-react"
import { signOut } from "@/actions/auth"
import { Badge } from "@/components/ui/badge"

export default async function TherapistDashboard() {
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

  // 치료사 정보 가져오기
  const { data: therapist } = await supabase
    .from("therapists")
    .select(`
      *,
      hospitals (*)
    `)
    .eq("id", user.id)
    .single()

  // 담당 환자 목록 가져오기
  const { data: patients } = await supabase
    .from("patients")
    .select(`
      *,
      profiles (*)
    `)
    .eq("therapist_id", user.id)

  // 활성 프로그램 수
  const { count: activeProgramsCount } = await supabase
    .from("programs")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "active")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">치료사 대시보드</h1>
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
          <p className="text-gray-600">
            {therapist?.hospitals?.name && `소속: ${therapist.hospitals.name}`}
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                담당 환자
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{patients?.length || 0}명</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                활성 프로그램
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeProgramsCount || 0}개</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>병원 코드</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-mono">
                {therapist?.hospitals?.code || "없음"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                환자 등록 시 사용하세요
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>환자 관리</CardTitle>
              <CardDescription>담당 환자를 관리하고 프로그램을 할당하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/therapist/patients">
                  <Users className="h-4 w-4 mr-2" />
                  환자 목록 보기
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>프로그램 관리</CardTitle>
              <CardDescription>재활 프로그램을 생성하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/therapist/programs">
                  <Plus className="h-4 w-4 mr-2" />
                  프로그램 관리
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 최근 환자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>담당 환자 목록</CardTitle>
            <CardDescription>최근 등록된 환자들</CardDescription>
          </CardHeader>
          <CardContent>
            {patients && patients.length > 0 ? (
              <div className="space-y-3">
                {patients.map((patient: any) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {patient.profiles?.name || "이름 없음"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {patient.diagnosis && `진단: ${patient.diagnosis}`}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/therapist/patients/${patient.id}`}>상세보기</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                아직 등록된 환자가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

