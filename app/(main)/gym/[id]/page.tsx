import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Globe, Clock, MessageSquare } from "lucide-react"
import { getGymById, getGymCrowdLevel } from "@/actions/gym"
import { GymReviews } from "@/components/gym/GymReviews"
import { FavoriteButton } from "@/components/gym/FavoriteButton"

export default async function GymDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const result = await getGymById(params.id)

  if (result.error || !result.data) {
    notFound()
  }

  const gym = result.data
  const facilities = gym.gym_facilities?.[0]

  // 현재 혼잡도 가져오기
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  const crowdResult = await getGymCrowdLevel(params.id, dayOfWeek, currentTime)
  const crowdLevel = crowdResult.data?.expected_level || "보통"

  // 사용자 ID 가져오기 (익명 사용자도 가능)
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || "anonymous"

  return (
    <div className="min-h-screen bg-[#1A1B1D]">
      {/* Header */}
      <header className="bg-[#1A1B1D] border-b border-[#2A2B2D] sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="sm" asChild className="min-w-[44px] min-h-[44px]">
            <Link href="/map">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-base md:text-lg font-bold text-[#01B395] flex-1 truncate">{gym.name}</h1>
          <FavoriteButton gymId={gym.id} userId={userId} />
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-4xl">
        {/* Basic Info */}
        <Card className="mb-6 bg-[#252628] border-[#2A2B2D]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>{gym.name}</span>
              <Badge
                variant={
                  crowdLevel === "한산"
                    ? "default"
                    : crowdLevel === "보통"
                    ? "secondary"
                    : "destructive"
                }
                className={crowdLevel === "한산" ? "bg-[#01B395] text-white" : ""}
              >
                {crowdLevel}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-300">{gym.address}</p>
              </div>
            </div>

            {gym.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <a href={`tel:${gym.phone}`} className="text-[#01B395] hover:underline">
                  {gym.phone}
                </a>
              </div>
            )}

            {gym.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-400" />
                <a
                  href={gym.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#01B395] hover:underline"
                >
                  웹사이트
                </a>
              </div>
            )}

            {gym.operating_hours && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  {gym.operating_hours.weekday && (
                    <p className="text-gray-300">평일: {gym.operating_hours.weekday}</p>
                  )}
                  {gym.operating_hours.weekend && (
                    <p className="text-gray-300">주말: {gym.operating_hours.weekend}</p>
                  )}
                </div>
              </div>
            )}

            {gym.price_range && (
              <div>
                <p className="text-sm text-gray-400">가격대: {gym.price_range}</p>
              </div>
            )}

            {gym.description && (
              <div>
                <p className="text-gray-300">{gym.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facilities */}
        {facilities && (
          <Card className="mb-6 bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <CardTitle className="text-white">시설 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facilities.has_shower && (
                  <Badge variant="outline" className="justify-center py-2 border-[#01B395] text-[#01B395]">
                    샤워실
                  </Badge>
                )}
                {facilities.has_parking && (
                  <Badge variant="outline" className="justify-center py-2 border-[#01B395] text-[#01B395]">
                    주차 가능
                  </Badge>
                )}
                {facilities.has_rehab_equipment && (
                  <Badge variant="outline" className="justify-center py-2 border-[#01B395] text-[#01B395]">
                    재활기구
                  </Badge>
                )}
                {facilities.has_pt_coach && (
                  <Badge variant="outline" className="justify-center py-2 border-[#01B395] text-[#01B395]">
                    PT/재활코치
                  </Badge>
                )}
                {facilities.is_quiet && (
                  <Badge variant="outline" className="justify-center py-2 border-[#01B395] text-[#01B395]">
                    조용한 분위기
                  </Badge>
                )}
              </div>
              {facilities.equipment_types && facilities.equipment_types.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">보유 기구:</p>
                  <div className="flex flex-wrap gap-2">
                    {facilities.equipment_types.map((equipment) => (
                      <Badge key={equipment} variant="secondary" className="bg-[#1A1B1D] text-gray-300">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card className="bg-[#252628] border-[#2A2B2D]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-[#01B395]" />
              리뷰
            </CardTitle>
            <CardDescription className="text-gray-400">
              다른 사용자들의 태그 리뷰를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GymReviews gymId={gym.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

