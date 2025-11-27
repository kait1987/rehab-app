"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Dumbbell, Clock, MapPin, Save } from "lucide-react"
import Link from "next/link"
import { generateCourse } from "@/actions/course"
import { CourseQuestionnaire, UserCourse, CourseExercise } from "@/types"

export default function CourseResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasGenerated = useRef(false)

  useEffect(() => {
    // 중복 실행 방지
    if (hasGenerated.current) return
    
    const dataParam = searchParams.get("data")
    if (!dataParam) {
      setError("코스 데이터가 없습니다.")
      setIsLoading(false)
      return
    }

    hasGenerated.current = true

    try {
      const questionnaire: CourseQuestionnaire = JSON.parse(decodeURIComponent(dataParam))
      generateCourse(questionnaire)
        .then((result) => {
          if (result.error) {
            // 데이터베이스 테이블 오류인 경우 특별 처리
            if (result.error.includes('schema cache') || 
                result.error.includes('데이터베이스 테이블이 없습니다') ||
                result.error.includes('relation') ||
                result.error.includes('does not exist')) {
              setError(result.error)
            } else {
              setError(result.error)
            }
          } else {
            setCourse(result.data)
          }
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('코스 생성 오류:', err)
          const errorMessage = err instanceof Error ? err.message : "코스를 생성하는 중 오류가 발생했습니다."
          setError(errorMessage)
          setIsLoading(false)
        })
    } catch (err) {
      setError("데이터를 파싱하는 중 오류가 발생했습니다.")
      setIsLoading(false)
    }
  }, [searchParams])

  const handleFindGyms = () => {
    if (!course) return

    // 코스에 맞는 필터 설정
    const filters: any = {}
    
    // 재활 코스이므로 조용한 곳과 재활기구가 있는 곳을 우선 추천
    filters.isQuiet = true
    
    // 코스에 필요한 기구가 있으면 재활기구 보유 헬스장 필터 적용
    if (course.equipment_types && course.equipment_types.length > 0) {
      filters.hasRehabEquipment = true
    }
    
    // 통증 레벨이 높으면 조용한 곳을 더 강조
    if (course.pain_level && course.pain_level >= 4) {
      filters.isQuiet = true
    }

    const filterParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) filterParams.append(key, "true")
    })

    // 코스 정보를 URL에 포함하여 지도 페이지에서 표시할 수 있도록 함
    if (course.body_part) {
      filterParams.append("courseBodyPart", course.body_part)
    }

    router.push(`/map?${filterParams.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1B1D] flex items-center justify-center p-4">
        <Card className="max-w-md bg-[#252628] border-[#2A2B2D]">
          <CardContent className="py-8 text-center">
            <p className="text-gray-400">코스를 생성하는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !course) {
    const isSupabaseError = error?.includes('Supabase') || error?.includes('데이터베이스') || error?.includes('환경 변수')
    
    return (
      <div className="min-h-screen bg-[#1A1B1D] flex items-center justify-center p-4">
        <Card className="max-w-md bg-[#252628] border-[#2A2B2D]">
          <CardContent className="py-8 text-center">
            <div className="mb-4">
              <p className="text-red-400 font-semibold mb-2">{error || "코스를 불러올 수 없습니다."}</p>
              {isSupabaseError && (
                <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded text-left">
                  <p className="text-sm text-yellow-300 mb-2">
                    <strong>Supabase 연결 문제 해결 방법:</strong>
                  </p>
                  <ol className="text-xs text-yellow-200 list-decimal list-inside space-y-1">
                    <li>.env 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되어 있는지 확인</li>
                    <li>Supabase 대시보드에서 프로젝트가 활성 상태인지 확인</li>
                    <li>개발 서버를 재시작하세요 (환경 변수 변경 후 필요)</li>
                    <li>자세한 내용은 SUPABASE_SETUP.md 파일을 참조하세요</li>
                  </ol>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full gradient-teal">
                <Link href="/course/create">다시 만들기</Link>
              </Button>
              {isSupabaseError && (
                <Button variant="outline" asChild className="w-full">
                  <a href="/api/health" target="_blank">연결 상태 확인</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className="text-lg md:text-xl font-bold text-[#01B395]">생성된 재활 코스</h1>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
        {/* Medical Disclaimer */}
        <Card className="mb-6 border-yellow-700 bg-yellow-900/30">
          <CardContent className="py-4">
            <p className="text-sm text-yellow-200">
              <strong>주의사항:</strong> 이 코스는 일반적인 재활 운동 가이드입니다. 의료진의 진단과 처방을 대체할 수 없으며, 통증이나 불편함이 있으면 즉시 중단하고 전문의와 상담하세요.
            </p>
          </CardContent>
        </Card>

        {/* Course Summary */}
        <Card className="mb-6 bg-[#252628] border-[#2A2B2D]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Dumbbell className="h-5 w-5 text-[#01B395]" />
              {course.body_part} 재활 코스
            </CardTitle>
            <CardDescription className="text-gray-400">
              총 {course.total_duration}분 · 준비운동 {course.warmup_duration}분 · 메인{" "}
              {course.main_duration}분 · 마무리 {course.cooldown_duration}분
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-[#01B395] text-white">통증 {course.pain_level}/5</Badge>
              <Badge variant="secondary" className="bg-[#252628] text-gray-300">{course.experience_level}</Badge>
              {course.equipment_types && course.equipment_types.length > 0 && (
                <Badge variant="outline" className="border-[#01B395] text-[#01B395]">
                  기구: {course.equipment_types.join(", ")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warmup Exercises */}
        {course.course_exercises?.filter((e: any) => e.section === "warmup").length > 0 && (
          <Card className="mb-6 bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-[#01B395]" />
                준비운동 ({course.warmup_duration}분)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.course_exercises
                  .filter((e: any) => e.section === "warmup")
                  .map((exercise: any, index: number) => (
                    <div key={exercise.id} className="border-l-4 border-[#01B395] pl-4">
                      <h4 className="font-semibold mb-1 text-white">
                        {index + 1}. {exercise.exercise_name}
                      </h4>
                      {exercise.exercise_templates && (
                        <p className="text-sm text-gray-400 mb-2">
                          {exercise.exercise_templates.description}
                        </p>
                      )}
                      {exercise.duration_seconds && (
                        <p className="text-sm text-gray-500">
                          시간: {Math.floor(exercise.duration_seconds / 60)}분
                        </p>
                      )}
                      {exercise.exercise_templates?.instructions && (
                        <p className="text-sm text-gray-300 mt-2">
                          <strong>방법:</strong> {exercise.exercise_templates.instructions}
                        </p>
                      )}
                      {exercise.exercise_templates?.precautions && (
                        <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
                          <p className="text-xs text-yellow-200">
                            <strong>주의:</strong> {exercise.exercise_templates.precautions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Exercises */}
        {course.course_exercises?.filter((e: any) => e.section === "main").length > 0 && (
          <Card className="mb-6 bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Dumbbell className="h-5 w-5 text-[#01B395]" />
                메인 재활운동 ({course.main_duration}분)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.course_exercises
                  .filter((e: any) => e.section === "main")
                  .map((exercise: any, index: number) => (
                    <div key={exercise.id} className="border-l-4 border-[#01B395] pl-4">
                      <h4 className="font-semibold mb-1 text-white">
                        {index + 1}. {exercise.exercise_name}
                      </h4>
                      {exercise.exercise_templates && (
                        <p className="text-sm text-gray-400 mb-2">
                          {exercise.exercise_templates.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-300 mb-2">
                        {exercise.sets && <span>세트: {exercise.sets}</span>}
                        {exercise.reps && <span>반복: {exercise.reps}회</span>}
                        {exercise.rest_seconds && (
                          <span>휴식: {exercise.rest_seconds}초</span>
                        )}
                      </div>
                      {exercise.exercise_templates?.instructions && (
                        <p className="text-sm text-gray-300 mt-2">
                          <strong>방법:</strong> {exercise.exercise_templates.instructions}
                        </p>
                      )}
                      {exercise.exercise_templates?.precautions && (
                        <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
                          <p className="text-xs text-yellow-200">
                            <strong>주의:</strong> {exercise.exercise_templates.precautions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cooldown Exercises */}
        {course.course_exercises?.filter((e: any) => e.section === "cooldown").length > 0 && (
          <Card className="mb-6 bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-[#01B395]" />
                마무리 스트레칭 ({course.cooldown_duration}분)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.course_exercises
                  .filter((e: any) => e.section === "cooldown")
                  .map((exercise: any, index: number) => (
                    <div key={exercise.id} className="border-l-4 border-[#01B395] pl-4">
                      <h4 className="font-semibold mb-1 text-white">
                        {index + 1}. {exercise.exercise_name}
                      </h4>
                      {exercise.exercise_templates && (
                        <p className="text-sm text-gray-400 mb-2">
                          {exercise.exercise_templates.description}
                        </p>
                      )}
                      {exercise.duration_seconds && (
                        <p className="text-sm text-gray-500">
                          시간: {Math.floor(exercise.duration_seconds / 60)}분
                        </p>
                      )}
                      {exercise.exercise_templates?.instructions && (
                        <p className="text-sm text-gray-300 mt-2">
                          <strong>방법:</strong> {exercise.exercise_templates.instructions}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Gym */}
        {course.recommendedGym && (
          <Card className="mt-6 bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MapPin className="h-5 w-5 text-[#01B395]" />
                추천 헬스장
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">{course.recommendedGym.name}</h3>
                <p className="text-sm text-gray-400">{course.recommendedGym.address}</p>
                <Button asChild variant="outline" className="mt-2">
                  <Link href={`/gym/${course.recommendedGym.id}`}>
                    헬스장 상세보기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 min-h-[44px] gradient-teal">
            <Link href="/course/create">새 코스 만들기</Link>
          </Button>
          <Button variant="outline" className="flex-1 min-h-[44px]">
            <Save className="h-4 w-4 mr-2" />
            저장하기
          </Button>
        </div>
      </div>
    </div>
  )
}

