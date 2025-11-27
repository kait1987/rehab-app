"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { CourseQuestionnaire } from "@/types"
import { CourseChatFlow } from "@/components/course/CourseChatFlow"

export default function CreateCoursePage() {
  const router = useRouter()
  const [questionnaire, setQuestionnaire] = useState<Partial<CourseQuestionnaire>>({})
  const [currentStep, setCurrentStep] = useState(0)

  const handleComplete = (data: CourseQuestionnaire) => {
    router.push(`/course/result?data=${encodeURIComponent(JSON.stringify(data))}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/main">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-blue-600">재활 코스 만들기</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              내 몸 상태로 재활 코스 만들기
            </CardTitle>
            <CardDescription>
              몇 가지 질문에 답하면 오늘 할 90분 재활 코스를 만들어드릴게요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseChatFlow onComplete={handleComplete} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

