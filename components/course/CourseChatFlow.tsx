"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CourseQuestionnaire } from "@/types"
import { MessageSquare, User } from "lucide-react"

interface CourseChatFlowProps {
  onComplete: (data: CourseQuestionnaire) => void
}

const BODY_PARTS = ["허리", "어깨", "무릎", "목", "기타"]
const EQUIPMENT_TYPES = ["덤벨", "머신", "매트", "밴드", "짐볼"]
const EXPERIENCE_LEVELS = [
  { value: "거의 안 함", label: "거의 안 함" },
  { value: "주 1-2회", label: "주 1-2회" },
  { value: "주 3회 이상", label: "주 3회 이상" },
]
const DURATIONS = [60, 90, 120]

export function CourseChatFlow({ onComplete }: CourseChatFlowProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<CourseQuestionnaire>>({})

  const handleAnswer = (key: keyof CourseQuestionnaire, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    if (step < 4) {
      setStep(step + 1)
    } else {
      // 마지막 질문이면 완료
      const finalAnswers: CourseQuestionnaire = {
        bodyPart: answers.bodyPart || "",
        painLevel: answers.painLevel || 1,
        equipmentTypes: answers.equipmentTypes || [],
        experienceLevel: answers.experienceLevel || "거의 안 함",
        duration: value || 90,
      }
      onComplete(finalAnswers)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const renderQuestion = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-[#01B395] mt-1" />
              <div className="flex-1">
                <p className="font-semibold mb-3 text-white">어느 부위가 가장 불편한가요?</p>
                <div className="grid grid-cols-2 gap-2">
                  {BODY_PARTS.map((part) => (
                    <Button
                      key={part}
                      variant={answers.bodyPart === part ? "default" : "outline"}
                      onClick={() => handleAnswer("bodyPart", part)}
                      className="justify-start min-h-[48px] text-base"
                    >
                      {part}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-[#01B395] mt-1" />
              <div className="flex-1">
                <p className="font-semibold mb-3 text-white">통증 정도는 어느 정도인가요? (1-5단계)</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      variant={answers.painLevel === level ? "default" : "outline"}
                      onClick={() => handleAnswer("painLevel", level)}
                      className="min-h-[48px] text-base"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  1: 거의 없음, 5: 매우 심함
                </p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-[#01B395] mt-1" />
              <div className="flex-1">
                <p className="font-semibold mb-3 text-white">
                  현재 헬스장에서 사용 가능한 기구를 선택해주세요 (복수 선택 가능)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EQUIPMENT_TYPES.map((equipment) => {
                    const isSelected = answers.equipmentTypes?.includes(equipment)
                    return (
                      <Button
                        key={equipment}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          const current = answers.equipmentTypes || []
                          const updated = isSelected
                            ? current.filter((e) => e !== equipment)
                            : [...current, equipment]
                          handleAnswer("equipmentTypes", updated)
                        }}
                        className="justify-start min-h-[48px] text-base"
                      >
                        {equipment}
                      </Button>
                    )
                  })}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  선택한 기구: {answers.equipmentTypes?.join(", ") || "없음"}
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-[#01B395] mt-1" />
              <div className="flex-1">
                <p className="font-semibold mb-3 text-white">평소 운동 빈도는 어느 정도인가요?</p>
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      variant={answers.experienceLevel === level.value ? "default" : "outline"}
                      onClick={() => handleAnswer("experienceLevel", level.value)}
                      className="w-full justify-start min-h-[48px] text-base"
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-[#01B395] mt-1" />
              <div className="flex-1">
                <p className="font-semibold mb-3 text-white">
                  오늘 운동 시간은 최대 몇 분까지 가능하신가요? (선택)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((duration) => (
                    <Button
                      key={duration}
                      variant={answers.duration === duration ? "default" : "outline"}
                      onClick={() => handleAnswer("duration", duration)}
                      className="min-h-[48px] text-base"
                    >
                      {duration}분
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  선택하지 않으면 기본 90분 코스가 생성됩니다
                </p>
                <Button
                  className="w-full mt-4 min-h-[52px] text-base font-semibold gradient-teal"
                  onClick={() => {
                    const finalAnswers: CourseQuestionnaire = {
                      bodyPart: answers.bodyPart || "",
                      painLevel: answers.painLevel || 1,
                      equipmentTypes: answers.equipmentTypes || [],
                      experienceLevel: answers.experienceLevel || "거의 안 함",
                      duration: answers.duration || 90,
                    }
                    onComplete(finalAnswers)
                  }}
                >
                  코스 생성하기
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* 안전 안내 문구 (첫 질문 전에만 표시) */}
      {step === 0 && (
        <Card className="bg-yellow-900/30 border-yellow-700 border-2">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                !
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-200 mb-1">
                  안전 안내사항
                </p>
                <p className="text-xs text-yellow-300">
                  본 서비스는 <strong>의료적 진단이나 치료가 아닌 일반적인 운동 정보</strong>를 제공합니다. 
                  통증이 심하거나 악화되면 즉시 중단하고 전문의와 상담하세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 진행 표시 */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>질문 {step + 1} / 5</span>
        <div className="flex-1 h-2 bg-[#2A2B2D] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#01B395] transition-all"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* 질문 및 답변 히스토리 */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {/* 이전 답변 표시 */}
        {step > 0 && answers.bodyPart && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-[#01B395] mt-1" />
            <Card className="flex-1 bg-[#252628] border-[#2A2B2D]">
              <CardContent className="p-3">
                <p className="text-sm text-gray-300">
                  <strong>부위:</strong> {answers.bodyPart}
                </p>
                {answers.painLevel && (
                  <p className="text-sm text-gray-300">
                    <strong>통증:</strong> {answers.painLevel}/5
                  </p>
                )}
                {answers.equipmentTypes && answers.equipmentTypes.length > 0 && (
                  <p className="text-sm text-gray-300">
                    <strong>기구:</strong> {answers.equipmentTypes.join(", ")}
                  </p>
                )}
                {answers.experienceLevel && (
                  <p className="text-sm text-gray-300">
                    <strong>운동 빈도:</strong> {answers.experienceLevel}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 현재 질문 */}
        {renderQuestion()}
      </div>

      {/* 뒤로가기 버튼 */}
      {step > 0 && (
        <Button variant="outline" onClick={handleBack} className="w-full min-h-[48px] text-base">
          이전 질문
        </Button>
      )}
    </div>
  )
}

