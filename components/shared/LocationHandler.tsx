"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getCurrentLocation } from "@/lib/kakao-map"

export function LocationHandler() {
  const pathname = usePathname()

  useEffect(() => {
    // 온보딩 완료 여부 확인
    const onboardingCompleted = localStorage.getItem("onboardingCompleted")
    if (!onboardingCompleted && pathname !== "/onboarding") {
      // 온보딩 페이지로 리다이렉트하지 않고, 위치만 요청
      getCurrentLocation()
        .then((location) => {
          localStorage.setItem("userLocation", JSON.stringify(location))
        })
        .catch(() => {
          // 위치 권한 거부 시 무시
        })
    }
  }, [pathname])

  return null
}

