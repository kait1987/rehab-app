import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { getConversations } from "@/actions/message"
import { TherapistMessageList } from "./TherapistMessageList"
import { TherapistMessageForm } from "./TherapistMessageForm"

export default async function TherapistMessagesPage({
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

  // 대화 목록 가져오기
  const conversationsResult = await getConversations()
  const conversations = conversationsResult.data || []

  const selectedUserId = searchParams.userId

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/therapist/dashboard">
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
                환자 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patients && patients.length > 0 ? (
                <div className="space-y-2">
                  {patients.map((patient: any) => {
                    const conversation = conversations.find(
                      (c: any) => c.userId === patient.id
                    )
                    return (
                      <Link
                        key={patient.id}
                        href={`/therapist/messages?userId=${patient.id}`}
                        className={`block p-3 rounded-lg border ${
                          selectedUserId === patient.id
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold">
                          {patient.profiles?.name || "이름 없음"}
                        </div>
                        {conversation && (
                          <div className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage}
                          </div>
                        )}
                        {conversation && conversation.unreadCount > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            읽지 않은 메시지 {conversation.unreadCount}개
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  담당 환자가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 메시지 영역 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedUserId
                  ? patients?.find((p: any) => p.id === selectedUserId)?.profiles
                      ?.name || "메시지"
                  : "메시지"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUserId ? (
                <>
                  <TherapistMessageList conversationUserId={selectedUserId} />
                  <TherapistMessageForm receiverId={selectedUserId} />
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  환자를 선택하여 메시지를 주고받으세요
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

