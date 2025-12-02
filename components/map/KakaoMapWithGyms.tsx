"use client"

import { useEffect, useRef, useState } from "react"
import { loadKakaoMapScript } from "@/lib/kakao-map"
import { Gym } from "@/types"
import { Button } from "@/components/ui/button"

interface KakaoMapWithGymsProps {
  center: { lat: number; lng: number }
  gyms: Gym[]
  onGymClick?: (gym: Gym) => void
  className?: string
}

export function KakaoMapWithGyms({ center, gyms, onGymClick, className }: KakaoMapWithGymsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<kakao.maps.Map | null>(null)
  const [markers, setMarkers] = useState<kakao.maps.Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    // 환경 변수 확인 (런타임에서도 확인)
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 
                   (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_KAKAO_MAP_API_KEY
    
    if (!apiKey || apiKey.trim() === '') {
      const currentDomain = window.location.origin
      console.error('Kakao Map API key is not set', { domain: currentDomain })
      setError(
        `Kakao Map API 키가 설정되지 않았습니다.\n` +
        `현재 도메인: ${currentDomain}\n` +
        `Vercel 환경 변수에 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 설정하세요.`
      )
      setIsLoading(false)
      return
    }

    const initializeMap = () => {
      if (!mapRef.current) return

      // kakao 객체 확인
      if (!window.kakao || !window.kakao.maps) {
        setError("Kakao Map API가 로드되지 않았습니다. 페이지를 새로고침하세요.")
        setIsLoading(false)
        return
      }

      // maps.load를 사용하여 안전하게 초기화
      window.kakao.maps.load(() => {
        if (!mapRef.current) return

        const mapOption = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: 4, // Zoom level
        }

        try {
          const kakaoMap = new window.kakao.maps.Map(mapRef.current, mapOption)
          setMap(kakaoMap)
          setIsLoading(false)
          setError(null)
        } catch (err: any) {
          console.error('지도 생성 실패:', err)
          setError(
            `지도를 생성하는 중 오류가 발생했습니다.\n` +
            `오류: ${err?.message || '알 수 없는 오류'}\n` +
            `도메인이 카카오 개발자 콘솔에 등록되어 있는지 확인하세요.`
          )
          setIsLoading(false)
        }
      })
    }

    loadKakaoMapScript(apiKey)
      .then(() => {
        initializeMap()
      })
      .catch((err) => {
        console.error('Kakao Map 로드 실패:', err)
        setError(err.message || "지도를 불러오는 중 오류가 발생했습니다.")
        setIsLoading(false)
      })

    // 클린업 함수
    return () => {
      // 컴포넌트 언마운트 시 정리
    }
  }, [center.lat, center.lng])

  useEffect(() => {
    if (!map || !window.kakao) return

    // Remove existing markers
    markers.forEach((marker) => marker.setMap(null))
    const newMarkers: kakao.maps.Marker[] = []

    // Create gym markers
    gyms.forEach((gym) => {
      const markerPosition = new window.kakao.maps.LatLng(
        Number(gym.latitude),
        Number(gym.longitude)
      )

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: map,
        title: gym.name,
      })

      // Marker click event
      if (onGymClick) {
        window.kakao.maps.event.addListener(marker, "click", () => {
          onGymClick(gym)
        })
      }

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // Adjust map bounds to show all markers
    if (gyms.length > 0) {
      try {
        const bounds = new window.kakao.maps.LatLngBounds()
        gyms.forEach((gym) => {
          bounds.extend(
            new window.kakao.maps.LatLng(Number(gym.latitude), Number(gym.longitude))
          )
        })
        map.setBounds(bounds)
      } catch (err) {
        // Ignore if bounds is not supported
        console.warn("Failed to adjust map bounds:", err)
      }
    }
  }, [map, gyms, onGymClick])

  return (
    <div className={`relative ${className}`} style={{ width: "100%", height: "100%" }}>
      {/* 지도 컨테이너 - 항상 렌더링 */}
      <div id="map" ref={mapRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
      
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1A1B1D] bg-opacity-90 z-10">
          <div className="text-center">
            <p className="text-gray-400">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      
      {/* 에러 오버레이 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1A1B1D] bg-opacity-95 z-10 overflow-y-auto">
          <div className="text-center p-8 max-w-md">
            <p className="text-red-400 mb-4 font-semibold whitespace-pre-line text-left">
              {error}
            </p>
            <div className="text-sm text-gray-400 mb-6 text-left space-y-2">
              <p className="font-semibold text-gray-300">확인 사항:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Vercel 환경 변수에 <code className="bg-gray-800 px-1 rounded">NEXT_PUBLIC_KAKAO_MAP_API_KEY</code> 설정</li>
                <li>카카오 개발자 콘솔에 현재 도메인 등록</li>
                <li>JavaScript 키 사용 (REST API 키 아님)</li>
              </ol>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setError(null)
                  setIsLoading(true)
                  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 
                                 (typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_KAKAO_MAP_API_KEY : null)
                  if (apiKey) {
                    loadKakaoMapScript(apiKey)
                      .then(() => {
                        if (!mapRef.current) {
                          setError("지도 컨테이너를 찾을 수 없습니다. 페이지를 새로고침하세요.")
                          setIsLoading(false)
                          return
                        }
                        if (!window.kakao || !window.kakao.maps) {
                          setError("Kakao Map API가 로드되지 않았습니다.")
                          setIsLoading(false)
                          return
                        }
                        const mapOption = {
                          center: new window.kakao.maps.LatLng(center.lat, center.lng),
                          level: 4,
                        }
                        const kakaoMap = new window.kakao.maps.Map(mapRef.current, mapOption)
                        setMap(kakaoMap)
                        setIsLoading(false)
                        setError(null)
                      })
                      .catch((err) => {
                        console.error('지도 로드 재시도 실패:', err)
                        setError(err.message || "지도를 불러오는 중 오류가 발생했습니다.")
                        setIsLoading(false)
                      })
                  } else {
                    setError('Kakao Map API 키가 설정되지 않았습니다.')
                    setIsLoading(false)
                  }
                }}
                className="min-h-[44px]"
              >
                다시 시도
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload()
                  }
                }}
                className="min-h-[44px]"
              >
                페이지 새로고침
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

