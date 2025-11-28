import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { getPrograms, deleteProgram } from "@/actions/program"
import { Badge } from "@/components/ui/badge"

export default async function ProgramsPage() {
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

  const programsResult = await getPrograms()

  if (programsResult.error) {
    return <div>오류: {programsResult.error}</div>
  }

  const programs = programsResult.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/therapist/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-blue-600">프로그램 관리</h1>
          </div>
          <Button asChild>
            <Link href="/therapist/programs/new">
              <Plus className="h-4 w-4 mr-2" />
              새 프로그램
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {programs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">등록된 프로그램이 없습니다.</p>
              <Button asChild>
                <Link href="/therapist/programs/new">첫 프로그램 만들기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {programs.map((program: any) => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {program.name}
                        <Badge
                          variant={
                            program.status === "active"
                              ? "default"
                              : program.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {program.status === "active"
                            ? "진행중"
                            : program.status === "completed"
                            ? "완료"
                            : "일시정지"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        환자: {program.patients?.profiles?.name || "이름 없음"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/therapist/programs/${program.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          편집
                        </Link>
                      </Button>
                      <form action={async () => {
                        "use server"
                        await deleteProgram(program.id)
                      }}>
                        <Button variant="destructive" size="sm" type="submit">
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>시작일:</strong> {new Date(program.start_date).toLocaleDateString("ko-KR")}
                    </p>
                    {program.end_date && (
                      <p>
                        <strong>종료일:</strong> {new Date(program.end_date).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                    <p>
                      <strong>운동 수:</strong> {program.program_exercises?.length || 0}개
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

