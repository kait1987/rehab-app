'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Dumbbell, Clock, MapPin, Save } from "lucide-react"
import Link from "next/link"
import { generateCourse } from "@/actions/course"
import { CourseQuestionnaire, UserCourse, CourseExercise } from "@/types"

export default function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (!dataParam) {
      router.push("/course/create")
      return
    }

    try {
      const questionnaire: CourseQuestionnaire = JSON.parse(decodeURIComponent(dataParam))
      createCourse(questionnaire)
    } catch (err) {
      setError("코스 생성 데이터가 올바르지 않습니다.")
      setIsLoading(false)
    }
  }, [searchParams, router])

  const createCourse = async (questionnaire: CourseQuestionnaire) => {
    setIsLoading(true)
    try {
      const result = await generateCourse(questionnaire)
      if (result.error) {
        setError(result.error)
      } else {
        setCourse(result.data)
      }
    } catch (err) {
      setError(`오류가 발생했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCourse = () => {
    if (course) {
      const savedCourses = JSON.parse(localStorage.getItem("savedCourses") || "[]")
      savedCourses.push(course.id)
      localStorage.setItem("savedCourses", JSON.stringify(savedCourses))
      alert("코스가 저장되었습니다!")
    }
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">코스를 생성하는 중...</p>
          <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/course/create">다시 만들기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!course) {
    return null
  }

  const warmupExercises = course.course_exercises?.filter(
    (e: CourseExercise) => e.section === "warmup"
  ) || []
  const mainExercises = course.course_exercises?.filter(
    (e: CourseExercise) => e.section === "main"
  ) || []
  const cooldownExercises = course.course_exercises?.filter(
    (e: CourseExercise) => e.section === "cooldown"
  ) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="sm" asChild className="min-w-[44px] min-h-[44px]">
            <Link href="/main">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg md:text-xl font-bold text-blue-600 flex-1">생성된 재활 코스</h1>
          <Button variant="outline" size="sm" onClick={handleSaveCourse} className="min-h-[44px]">
            <Save className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">저장</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
        {/* 의료 안내 문구 */}
        <Card className="mb-4 md:mb-6 bg-yellow-50 border-yellow-400 border-2">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                !
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-2 text-sm md:text-base">중요 안내사항</h3>
                <p className="text-xs md:text-sm text-yellow-800 mb-2">
                  본 서비스에서 제공하는 재활 운동 코스는 <strong>의료적 진단이나 치료가 아닌, 일반적인 운동 정보</strong>입니다.
                </p>
                <ul className="text-xs md:text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>운동 중 통증이 심화되거나 불편함이 느껴지면 즉시 중단하시기 바랍니다.</li>
                  <li>심각한 통증이나 부상이 있는 경우 반드시 전문의와 상담하시기 바랍니다.</li>
                  <li>본 서비스의 운동 코스는 개인차가 있을 수 있으며, 모든 사용자에게 적합하지 않을 수 있습니다.</li>
                  <li>운동 전 충분한 준비운동과 운동 후 스트레칭을 권장합니다.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 코스 요약 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              {course.body_part} 재활 코스
            </CardTitle>
            <CardDescription>
              총 {course.total_duration}분 · 준비운동 {course.warmup_duration}분 · 메인{" "}
              {course.main_duration}분 · 마무리 {course.cooldown_duration}분
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>통증 {course.pain_level}/5</Badge>
              <Badge variant="secondary">{course.experience_level}</Badge>
              {course.equipment_types && course.equipment_types.length > 0 && (
                <Badge variant="outline">
                  기구: {course.equipment_types.join(", ")}
                </Badge>
              )}
            </div>
            <Button onClick={handleFindGyms} className="w-full min-h-[52px] text-base font-semibold">
              <MapPin className="h-4 w-4 mr-2" />
              이 코스 하기 좋은 근처 헬스장 보기
            </Button>
          </CardContent>
        </Card>

        {/* 준비운동 */}
        {warmupExercises.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                준비운동 ({course.warmup_duration}분)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {warmupExercises.map((exercise: CourseExercise, index: number) => (
                  <div key={exercise.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-1">
                      {index + 1}. {exercise.exercise_name}
                    </h4>
                    {exercise.exercise_templates && (
                      <p className="text-sm text-gray-600 mb-2">
                        {exercise.exercise_templates.description}
                      </p>
                    )}
                    {exercise.duration_seconds && (
                      <p className="text-sm text-gray-500">
                        시간: {Math.floor(exercise.duration_seconds / 60)}분
                      </p>
                    )}
                    {exercise.exercise_templates?.instructions && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>방법:</strong> {exercise.exercise_templates.instructions}
                      </p>
                    )}
                    {exercise.exercise_templates?.precautions && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
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

        {/* 메인 운동 */}
        {mainExercises.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                메인 재활운동 ({course.main_duration}분)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mainExercises.map((exercise: CourseExercise, index: number) => (
                  <div key={exercise.id} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold mb-1">
                      {index + 1}. {exercise.exercise_name}
                    </h4>
                    {exercise.exercise_templates && (
                      <p className="text-sm text-gray-600 mb-2">
                        {exercise.exercise_templates.description}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-700 mb-2">
                      {exercise.sets && <span>세트: {exercise.sets}</span>}
                      {exercise.reps && <span>반복: {exercise.reps}회</span>}
                      {exercise.rest_seconds && (
                        <span>휴식: {exercise.rest_seconds}초</span>
                      )}
                    </div>
                    {exercise.exercise_templates?.instructions && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>방법:</strong> {exercise.exercise_templates.instructions}
                      </p>
                    )}
                    {exercise.exercise_templates?.precautions && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
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

        {/* 마무리 스트레칭 */}
        {cooldownExercises.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                마무리 스트레칭 ({course.cooldown_duration}분)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cooldownExercises.map((exercise: CourseExercise, index: number) => (
                  <div key={exercise.id} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold mb-1">
                      {index + 1}. {exercise.exercise_name}
                    </h4>
                    {exercise.exercise_templates && (
                      <p className="text-sm text-gray-600 mb-2">
                        {exercise.exercise_templates.description}
                      </p>
                    )}
                    {exercise.duration_seconds && (
                      <p className="text-sm text-gray-500">
                        시간: {Math.floor(exercise.duration_seconds / 60)}분
                      </p>
                    )}
                    {exercise.exercise_templates?.instructions && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>방법:</strong> {exercise.exercise_templates.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}

