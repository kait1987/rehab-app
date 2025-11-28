"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Dumbbell, MessageSquare } from "lucide-react"
import { getCurrentLocation } from "@/lib/kakao-map"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [locationGranted, setLocationGranted] = useState(false)

  const handleLocationPermission = async () => {
    try {
      const location = await getCurrentLocation()
      setLocationGranted(true)
      // 위치 정보를 localStorage에 저장
      localStorage.setItem("userLocation", JSON.stringify(location))
      localStorage.setItem("onboardingCompleted", "true")
      router.push("/main")
    } catch (error) {
      // 위치 권한 거부 시에도 진행 가능
      localStorage.setItem("onboardingCompleted", "true")
      router.push("/main")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true")
    router.push("/main")
  }

  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#1A1B1D] gradient-dark flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#252628] border-[#2A2B2D]">
          <CardHeader className="text-center px-4 md:px-6 pt-6 md:pt-8">
            <CardTitle className="text-xl md:text-2xl mb-2 text-white">동네 재활 헬스장</CardTitle>
            <CardDescription className="text-sm md:text-base text-gray-400">
              동네에서 재활운동하기 좋은 헬스장과 내 몸에 맞는 재활 코스를 한 번에
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6 pb-6 md:pb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 md:h-5 md:w-5 text-[#01B395] flex-shrink-0" />
                <span className="text-base md:text-sm text-gray-300">내 주변 재활 헬스장 찾기</span>
              </div>
              <div className="flex items-center gap-3">
                <Dumbbell className="h-6 w-6 md:h-5 md:w-5 text-[#01B395] flex-shrink-0" />
                <span className="text-base md:text-sm text-gray-300">90분 재활 코스 만들기</span>
              </div>
            </div>
            <Button onClick={() => setStep(1)} className="w-full min-h-[52px] text-base font-semibold gradient-teal">
              시작하기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1B1D] gradient-dark flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-[#252628] border-[#2A2B2D]">
        <CardHeader className="text-center px-4 md:px-6 pt-6 md:pt-8">
          <MapPin className="h-10 w-10 md:h-12 md:w-12 text-[#01B395] mx-auto mb-4" />
          <CardTitle className="text-lg md:text-xl mb-2 text-white">위치 권한 안내</CardTitle>
          <CardDescription className="text-sm md:text-base text-gray-400">
            내 주변 헬스장을 찾기 위해 위치 정보가 필요합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 md:px-6 pb-6 md:pb-8">
          <div className="space-y-2 text-sm md:text-base text-gray-400">
            <p>• 현재 위치 기준 1km 내 헬스장을 검색합니다</p>
            <p>• 위치 정보는 검색 목적으로만 사용됩니다</p>
            <p>• 권한을 거부하셔도 동네 이름으로 검색 가능합니다</p>
          </div>
          <Button onClick={handleLocationPermission} className="w-full min-h-[52px] text-base font-semibold gradient-teal">
            위치 권한 허용하기
          </Button>
          <Button onClick={handleSkip} variant="outline" className="w-full min-h-[52px] text-base">
            나중에 설정하기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

