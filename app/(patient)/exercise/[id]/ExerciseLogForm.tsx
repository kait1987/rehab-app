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
import { Textarea } from "@/components/ui/textarea"
import { saveExerciseLog } from "@/actions/exercise"
import { CheckCircle2 } from "lucide-react"

const logSchema = z.object({
  setsCompleted: z.number().min(0).max(100),
  painLevel: z.number().min(1).max(5).optional(),
  difficultyLevel: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
})

type LogFormValues = z.infer<typeof logSchema>

interface ExerciseLogFormProps {
  programExerciseId: string
  patientId: string
  defaultSets: number
  todayLog?: any
}

export function ExerciseLogForm({
  programExerciseId,
  patientId,
  defaultSets,
  todayLog,
}: ExerciseLogFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      setsCompleted: todayLog?.sets_completed || 0,
      painLevel: todayLog?.pain_level || undefined,
      difficultyLevel: todayLog?.difficulty_level || undefined,
      notes: todayLog?.notes || "",
    },
  })

  const onSubmit = async (data: LogFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await saveExerciseLog({
        programExerciseId,
        patientId,
        setsCompleted: data.setsCompleted,
        painLevel: data.painLevel,
        difficultyLevel: data.difficultyLevel,
        notes: data.notes,
      })

      if (result.error) {
        alert(`기록 저장 실패: ${result.error}`)
      } else {
        setIsCompleted(true)
        setTimeout(() => {
          router.push("/patient/dashboard")
        }, 2000)
      }
    } catch (error) {
      alert(`오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">운동 기록이 저장되었습니다!</h3>
        <p className="text-gray-600">대시보드로 이동합니다...</p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="setsCompleted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>완료한 세트 수</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max={defaultSets}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                목표: {defaultSets}세트 (0-{defaultSets} 사이의 값을 입력하세요)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="painLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>통증 수준 (선택)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="통증 수준을 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 - 거의 없음</SelectItem>
                  <SelectItem value="2">2 - 약간</SelectItem>
                  <SelectItem value="3">3 - 보통</SelectItem>
                  <SelectItem value="4">4 - 심함</SelectItem>
                  <SelectItem value="5">5 - 매우 심함</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>운동 중 느낀 통증 수준을 선택하세요</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficultyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>난이도 (선택)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="난이도를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 - 매우 쉬움</SelectItem>
                  <SelectItem value="2">2 - 쉬움</SelectItem>
                  <SelectItem value="3">3 - 보통</SelectItem>
                  <SelectItem value="4">4 - 어려움</SelectItem>
                  <SelectItem value="5">5 - 매우 어려움</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>운동의 난이도를 평가하세요</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="운동에 대한 메모를 남겨주세요..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "기록 저장"}
        </Button>
      </form>
    </Form>
  )
}

