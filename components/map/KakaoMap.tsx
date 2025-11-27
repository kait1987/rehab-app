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
      setError("Kakao Map API key is not set")
      setIsLoading(false)
      return
    }

    loadKakaoMapScript(apiKey)
      .then(() => {
        if (!mapRef.current) return

        const mapOption = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: 4, // Zoom level
        }

        const kakaoMap = new window.kakao.maps.Map(mapRef.current, mapOption)
        setMap(kakaoMap)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
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
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-sm text-gray-600 mb-4">Unable to load map</p>
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
                    setError(err.message)
                    setIsLoading(false)
                  })
              }
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={className} style={{ width: "100%", height: "100%" }} />
}

