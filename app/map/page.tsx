"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { KakaoMapWithGyms } from "@/components/map/KakaoMapWithGyms"
import { getNearbyGyms } from "@/actions/gym"
import { getCurrentLocation, geocodeAddress, loadKakaoMapScript } from "@/lib/kakao-map"
import { Gym } from "@/types"
import { MapPin, Search, Filter, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GymFilters } from "@/components/gym/GymFilters"

export default function MapPage() {
  const router = useRouter()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{
    isQuiet?: boolean
    hasRehabEquipment?: boolean
    hasParking?: boolean
    hasShower?: boolean
    hasPtCoach?: boolean
  }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"map" | "list">("map") // 모바일용 뷰 모드

  useEffect(() => {
    loadLocationAndGyms()
  }, [])

  useEffect(() => {
    if (location) {
      loadGyms()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, filters])

  const loadLocationAndGyms = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // localStorage에서 저장된 위치 확인
      const savedLocation = localStorage.getItem("userLocation")
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation)
          setLocation(location)
          setIsLoading(false)
          return
        } catch (parseError) {
          console.warn('저장된 위치 파싱 오류:', parseError)
          localStorage.removeItem("userLocation")
        }
      }

      // 현재 위치 가져오기
      const currentLocation = await getCurrentLocation()
      setLocation(currentLocation)
      localStorage.setItem("userLocation", JSON.stringify(currentLocation))
      setIsLoading(false)
    } catch (err) {
      console.error('위치 가져오기 오류:', err)
      // 위치 권한 거부 또는 오류 시 기본 위치 (강남역)
      const defaultLocation = { lat: 37.4979, lng: 127.0276 }
      setLocation(defaultLocation)
      setError("위치 정보를 가져올 수 없어 기본 위치(강남역)로 표시합니다.")
      setIsLoading(false)
    }
  }

  const loadGyms = async () => {
    if (!location) return

    setIsLoading(true)
    try {
      const result = await getNearbyGyms(location.lat, location.lng, 1, filters)
      if (result.error) {
        setError(result.error)
      } else {
        setGyms(result.data || [])
      }
    } catch (err) {
      setError("헬스장 정보를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGymClick = (gym: Gym) => {
    setSelectedGym(gym)
    router.push(`/gym/${gym.id}`)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("동네 이름을 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 카카오맵 API가 로드되어 있는지 확인
      if (!window.kakao || !window.kakao.maps) {
        const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
        if (!apiKey) {
          setError("카카오맵 API 키가 설정되지 않았습니다.")
          setIsLoading(false)
          return
        }
        await loadKakaoMapScript(apiKey)
      }

      const result = await geocodeAddress(searchQuery)
      if (result) {
        const newLocation = { lat: result.latitude, lng: result.longitude }
        setLocation(newLocation)
        localStorage.setItem("userLocation", JSON.stringify(newLocation))
        setError(null)
      } else {
        setError("검색 결과를 찾을 수 없습니다. 다른 동네 이름으로 검색해주세요.")
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "동네 검색 중 오류가 발생했습니다."
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (error && !location) {
    return (
      <div className="min-h-screen bg-[#1A1B1D] flex items-center justify-center p-4">
        <Card className="max-w-md bg-[#252628] border-[#2A2B2D]">
          <CardContent className="py-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <div className="space-y-2">
              <Input
                placeholder="동네 이름 입력 (예: 강남역, 홍대입구)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} className="w-full gradient-teal">
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/main">홈으로 돌아가기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1B1D]">
      {/* Header */}
      <header className="bg-[#1A1B1D] border-b border-[#2A2B2D] sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild className="min-w-[44px] min-h-[44px]">
              <Link href="/main">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg md:text-xl font-bold text-[#01B395] flex-1">주변 헬스장</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="min-w-[44px] min-h-[44px]"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="동네 이름 입력"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 text-base"
            />
            <Button onClick={handleSearch} size="sm" className="min-w-[60px] min-h-[44px] gradient-teal">
              <Search className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">검색</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      {showFilters && (
        <div className="bg-[#252628] border-b border-[#2A2B2D] p-4">
          <GymFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Mobile View Toggle */}
      <div className="md:hidden bg-[#252628] border-b border-[#2A2B2D]">
        <div className="flex">
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              viewMode === "map"
                ? "text-[#01B395] border-b-2 border-[#01B395]"
                : "text-gray-400"
            }`}
          >
            지도
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              viewMode === "list"
                ? "text-[#01B395] border-b-2 border-[#01B395]"
                : "text-gray-400"
            }`}
          >
            리스트 ({gyms.length})
          </button>
        </div>
      </div>

      {/* Map and List */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
        {/* Map */}
        <div className={`${viewMode === "map" ? "flex" : "hidden"} md:flex flex-1 relative bg-[#1A1B1D]`}>
          {location ? (
            <KakaoMapWithGyms
              center={location}
              gyms={gyms}
              onGymClick={handleGymClick}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1A1B1D]">
              <p className="text-gray-400">지도를 불러오는 중...</p>
            </div>
          )}
        </div>

        {/* Gym List */}
        <div className={`${viewMode === "list" ? "flex" : "hidden"} md:flex w-full md:w-96 bg-[#252628] border-l border-[#2A2B2D] overflow-y-auto`}>
          <div className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold mb-2 text-white">
                주변 헬스장 {gyms.length}개
              </h2>
              {location && (
                <p className="text-sm text-gray-400">
                  반경 1km 내 검색 결과
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">검색 중...</p>
              </div>
            ) : gyms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">주변에 헬스장이 없습니다</p>
                <p className="text-sm text-gray-500">
                  필터를 조정하거나 다른 위치에서 검색해보세요
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {gyms.map((gym) => (
                  <Card
                    key={gym.id}
                    className="cursor-pointer hover:shadow-md transition-shadow active:bg-[#2A2B2D] bg-[#252628] border-[#2A2B2D]"
                    onClick={() => handleGymClick(gym)}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-white">{gym.name}</h3>
                        <Badge variant="outline" className="border-[#01B395] text-[#01B395]">
                          {gym.distance ? `${gym.distance.toFixed(1)}km` : ""}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {gym.address}
                      </p>
                      {gym.gym_facilities?.[0] && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {gym.gym_facilities[0].is_quiet && (
                            <Badge variant="secondary" className="text-xs bg-[#1A1B1D] text-gray-300">
                              조용함
                            </Badge>
                          )}
                          {gym.gym_facilities[0].has_rehab_equipment && (
                            <Badge variant="secondary" className="text-xs bg-[#1A1B1D] text-gray-300">
                              재활기구
                            </Badge>
                          )}
                          {gym.gym_facilities[0].has_parking && (
                            <Badge variant="secondary" className="text-xs bg-[#1A1B1D] text-gray-300">
                              주차
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

