"use client"

import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface ProgressCalendarProps {
  logs: any[]
}

export function ProgressCalendar({ logs }: ProgressCalendarProps) {
  // 날짜별 완료 여부 맵 생성
  const completedDates = new Set(
    logs.map((log) => log.exercise_date)
  )

  // 날짜별 완료한 운동 수
  const exerciseCountByDate = logs.reduce((acc, log) => {
    const date = log.exercise_date
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const modifiers = {
    completed: (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      return completedDates.has(dateStr)
    },
  }

  const modifiersClassNames = {
    completed: "bg-green-100 text-green-800 font-semibold",
  }

  return (
    <div className="space-y-4">
      <Calendar
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className="rounded-md border"
      />
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>운동 완료일</span>
        </div>
        <div className="text-gray-500">
          총 {completedDates.size}일 운동 완료
        </div>
      </div>
    </div>
  )
}

