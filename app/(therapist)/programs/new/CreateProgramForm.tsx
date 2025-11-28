"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createProgram, addExerciseToProgram } from "@/actions/program"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"

const programSchema = z.object({
  patientId: z.string().min(1, "환자를 선택해주세요"),
  name: z.string().min(1, "프로그램 이름을 입력해주세요"),
  startDate: z.string().min(1, "시작일을 선택해주세요"),
  endDate: z.string().optional(),
})

type ProgramFormValues = z.infer<typeof programSchema>

interface ExerciseForm {
  exerciseTemplateId: string
  dayOfWeek: number[]
  sets: number
  reps: number
  restSeconds?: number
}

interface CreateProgramFormProps {
  patients: any[]
  exerciseTemplates: any[]
}

export function CreateProgramForm({ patients, exerciseTemplates }: CreateProgramFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exercises, setExercises] = useState<ExerciseForm[]>([])

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      startDate: new Date().toISOString().split("T")[0],
    },
  })

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseTemplateId: "",
        dayOfWeek: [],
        sets: 3,
        reps: 10,
        restSeconds: 60,
      },
    ])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof ExerciseForm, value: any) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const toggleDayOfWeek = (index: number, day: number) => {
    const exercise = exercises[index]
    const dayOfWeek = exercise.dayOfWeek.includes(day)
      ? exercise.dayOfWeek.filter((d) => d !== day)
      : [...exercise.dayOfWeek, day]
    updateExercise(index, "dayOfWeek", dayOfWeek)
  }

  const onSubmit = async (data: ProgramFormValues) => {
    if (exercises.length === 0) {
      alert("최소 하나의 운동을 추가해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      // 프로그램 생성
      const programResult = await createProgram({
        patientId: data.patientId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      })

      if (programResult.error) {
        alert(`프로그램 생성 실패: ${programResult.error}`)
        return
      }

      // 운동 추가
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i]
        if (!exercise.exerciseTemplateId || exercise.dayOfWeek.length === 0) {
          continue
        }

        const exerciseResult = await addExerciseToProgram({
          programId: programResult.data!.id,
          exerciseTemplateId: exercise.exerciseTemplateId,
          dayOfWeek: exercise.dayOfWeek,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          orderIndex: i,
        })

        if (exerciseResult.error) {
          console.error(`운동 추가 실패: ${exerciseResult.error}`)
        }
      }

      alert("프로그램이 성공적으로 생성되었습니다!")
      router.push("/therapist/programs")
    } catch (error) {
      alert(`오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/therapist/programs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-blue-600">새 프로그램 만들기</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>프로그램 정보</CardTitle>
            <CardDescription>재활 프로그램의 기본 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>환자 선택</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="환자를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.profiles?.name || "이름 없음"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>프로그램 이름</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 무릎 재활 1단계" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>시작일</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>종료일 (선택)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>운동 추가</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                      <Plus className="h-4 w-4 mr-2" />
                      운동 추가
                    </Button>
                  </div>

                  {exercises.map((exercise, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">운동 {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExercise(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div>
                            <Label>운동 선택</Label>
                            <Select
                              value={exercise.exerciseTemplateId}
                              onValueChange={(value) =>
                                updateExercise(index, "exerciseTemplateId", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="운동을 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                {exerciseTemplates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name} ({template.body_part})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>요일 선택</Label>
                            <div className="flex gap-2 mt-2">
                              {dayLabels.map((label, day) => (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`day-${index}-${day + 1}`}
                                    checked={exercise.dayOfWeek.includes(day + 1)}
                                    onCheckedChange={() => toggleDayOfWeek(index, day + 1)}
                                  />
                                  <label
                                    htmlFor={`day-${index}-${day + 1}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>세트</Label>
                              <Input
                                type="number"
                                min="1"
                                value={exercise.sets}
                                onChange={(e) =>
                                  updateExercise(index, "sets", parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div>
                              <Label>반복</Label>
                              <Input
                                type="number"
                                min="1"
                                value={exercise.reps}
                                onChange={(e) =>
                                  updateExercise(index, "reps", parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div>
                              <Label>휴식(초)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={exercise.restSeconds || 0}
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    "restSeconds",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {exercises.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      운동을 추가해주세요
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "생성 중..." : "프로그램 생성"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

