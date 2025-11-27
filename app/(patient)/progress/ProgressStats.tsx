"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, Target, Activity } from "lucide-react"
import { useMemo } from "react"

interface ProgressStatsProps {
  logs: any[]
  programs: any[]
}

export function ProgressStats({ logs, programs }: ProgressStatsProps) {
  const stats = useMemo(() => {
    // 최근 7일 기록
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentLogs = logs.filter(
      (log) => new Date(log.exercise_date) >= sevenDaysAgo
    )

    // 완료한 운동 세트 수
    const totalSetsCompleted = logs.reduce(
      (sum, log) => sum + (log.sets_completed || 0),
      0
    )

    // 완료한 날짜 수
    const completedDates = new Set(logs.map((log) => log.exercise_date))
    const completionRate =
      programs.length > 0
        ? (completedDates.size / 30) * 100 // 최근 30일 기준
        : 0

    // 평균 통증 수준
    const painLevels = logs
      .map((log) => log.pain_level)
      .filter((level) => level !== null && level !== undefined)
    const avgPainLevel =
      painLevels.length > 0
        ? painLevels.reduce((sum, level) => sum + level, 0) / painLevels.length
        : 0

    return {
      recentExerciseDays: recentLogs.length,
      totalSetsCompleted,
      completionRate: Math.round(completionRate),
      avgPainLevel: avgPainLevel.toFixed(1),
    }
  }, [logs, programs])

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">최근 7일 운동일</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentExerciseDays}일</div>
          <p className="text-xs text-muted-foreground">지난 7일간</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 완료 세트</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSetsCompleted}</div>
          <p className="text-xs text-muted-foreground">누적 세트 수</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">완료율</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
          <p className="text-xs text-muted-foreground">최근 30일 기준</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">평균 통증</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgPainLevel}</div>
          <p className="text-xs text-muted-foreground">5점 만점</p>
        </CardContent>
      </Card>
    </div>
  )
}

