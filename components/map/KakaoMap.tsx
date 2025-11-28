"use client"

import { useEffect, useRef, useState } from "react"
import { loadKakaoMapScript } from "@/lib/kakao-map"
import { Gym } from "@/types"
import { Button } from "@/components/ui/button"

interface KakaoMapProps {
  center: { lat: number; lng: number }
  gyms: Gym[]
  onGymClick?: (gym: Gym) => void
  className?: string
}

export function KakaoMap({ center, gyms, onGymClick, className }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<kakao.maps.Map | null>(null)
  const [markers, setMarkers] = useState<kakao.maps.Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
    if (!apiKey) {
      console.error('Kakao Map API key is not set')
      setError("Kakao Map API 키가 설정되지 않았습니다. .env 파일을 확인하세요.")
      setIsLoading(false)
      return
    }

    console.log('Kakao Map 로딩 시작:', { center, apiKey: apiKey.substring(0, 10) + '...' })

    loadKakaoMapScript(apiKey)
      .then(() => {
        if (!mapRef.current) {
          console.error('mapRef.current is null')
          setError("지도 컨테이너를 찾을 수 없습니다.")
          setIsLoading(false)
          return
        }

        console.log('Kakao Map 스크립트 로드 완료, 지도 생성 중...')

        const mapOption = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: 4, // Zoom level
        }

        const kakaoMap = new window.kakao.maps.Map(mapRef.current, mapOption)
        console.log('Kakao Map 생성 완료:', kakaoMap)
        setMap(kakaoMap)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Kakao Map 로드 실패:', err)
        setError(err.message || "지도를 불러오는 중 오류가 발생했습니다.")
        setIsLoading(false)
      })
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

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-[#1A1B1D] ${className}`}>
        <div className="text-center p-8">
          <p className="text-red-400 mb-2 font-semibold">{error}</p>
          <p className="text-sm text-gray-400 mb-4">지도를 불러올 수 없습니다</p>
          <Button
            variant="outline"
            onClick={() => {
              setError(null)
              setIsLoading(true)
              const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
              if (apiKey) {
                loadKakaoMapScript(apiKey)
                  .then(() => {
                    if (!mapRef.current) return
                    const mapOption = {
                      center: new window.kakao.maps.LatLng(center.lat, center.lng),
                      level: 4,
                    }
                    const kakaoMap = new window.kakao.maps.Map(mapRef.current, mapOption)
                    setMap(kakaoMap)
                    setIsLoading(false)
                  })
                  .catch((err) => {
                    console.error('지도 로드 재시도 실패:', err)
                    setError(err.message)
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
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-[#1A1B1D] ${className}`}>
        <div className="text-center">
          <p className="text-gray-400">지도를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return <div id="map" ref={mapRef} className={className} style={{ width: "100%", height: "100%" }} />
}
