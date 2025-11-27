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
    <div className="min-h-screen bg-[#1A1B1D]">
      {/* Header */}
      <header className="bg-[#1A1B1D] border-b border-[#2A2B2D] sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="sm" asChild className="min-w-[44px] min-h-[44px]">
            <Link href="/main">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg md:text-xl font-bold text-[#01B395]">재활 코스 만들기</h1>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-2xl">
        <Card className="bg-[#252628] border-[#2A2B2D]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-[#01B395]" />
              내 몸 상태로 재활 코스 만들기
            </CardTitle>
            <CardDescription className="text-gray-400">
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

