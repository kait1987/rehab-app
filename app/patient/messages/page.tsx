import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MessageSquare, Send } from "lucide-react"
import { getConversations } from "@/actions/message"
import { MessageList } from "./MessageList"
import { MessageForm } from "./MessageForm"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { userId?: string }
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

  // 담당 치료사 정보 가져오기
  const { data: patient } = await supabase
    .from("patients")
    .select(`
      *,
      therapists!inner (
        *,
        profiles (*)
      )
    `)
    .eq("id", user.id)
    .single()

  const therapistId = patient?.therapist_id
  const therapist = patient?.therapists?.profiles

  // 대화 목록 가져오기
  const conversationsResult = await getConversations()
  const conversations = conversationsResult.data || []

  // 선택된 대화 상대
  const selectedUserId = searchParams.userId || therapistId

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
          <h1 className="text-2xl font-bold text-blue-600">메시지</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* 대화 목록 */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                대화 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              {therapist ? (
                <div className="space-y-2">
                  <Link
                    href={`/patient/messages?userId=${therapistId}`}
                    className={`block p-3 rounded-lg border ${
                      selectedUserId === therapistId
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold">{therapist.name}</div>
                    <div className="text-sm text-gray-600">담당 치료사</div>
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  담당 치료사가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 메시지 영역 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {therapist && selectedUserId === therapistId
                  ? therapist.name
                  : "메시지"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUserId ? (
                <>
                  <MessageList conversationUserId={selectedUserId} />
                  <MessageForm receiverId={selectedUserId} />
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  대화 상대를 선택하세요
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

