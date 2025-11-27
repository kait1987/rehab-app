import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Dumbbell, MessageSquare, Calendar } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1A1B1D] gradient-dark">
      {/* Header */}
      <header className="border-b border-[#2A2B2D] bg-[#1A1B1D]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#01B395]">동네 재활 헬스장</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-white leading-tight">
          동네에서 재활운동하기 좋은 헬스장을 찾고,
        </h2>
        <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 px-2">
          내 몸 상태에 맞는 90분 재활 코스를 만들어보세요
        </p>
      </section>

      {/* Main Features */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <MapPin className="h-8 w-8 text-[#01B395] mb-2" />
              <CardTitle className="text-white">내 주변 재활 헬스장 찾기</CardTitle>
              <CardDescription className="text-gray-400">
                현재 위치 기준 1km 내 재활운동하기 좋은 헬스장을 찾아보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full gradient-teal hover:opacity-90">
                <Link href="/map">지도에서 찾기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <Dumbbell className="h-8 w-8 text-[#01B395] mb-2" />
              <CardTitle className="text-white">내 몸 상태로 재활 코스 만들기</CardTitle>
              <CardDescription className="text-gray-400">
                몇 가지 질문에 답하면 오늘 할 90분 재활 코스를 만들어드릴게요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full gradient-teal hover:opacity-90">
                <Link href="/course/create">코스 만들기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <h3 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 text-white">주요 기능</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
          <Card className="bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <MapPin className="h-6 w-6 text-[#01B395] mb-2" />
              <CardTitle className="text-lg text-white">위치 기반 검색</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                현재 위치 기준 1km 내 재활 친화 헬스장 검색
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <MessageSquare className="h-6 w-6 text-[#01B395] mb-2" />
              <CardTitle className="text-lg text-white">태그 리뷰</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                조용함, 재활친화 등 태그로 빠르게 정보 확인
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <Dumbbell className="h-6 w-6 text-[#01B395] mb-2" />
              <CardTitle className="text-lg text-white">맞춤 코스</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                내 상태에 맞는 90분 재활 운동 코스 자동 생성
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#252628] border-[#2A2B2D]">
            <CardHeader>
              <Calendar className="h-6 w-6 text-[#01B395] mb-2" />
              <CardTitle className="text-lg text-white">혼잡도 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                시간대별 예상 혼잡도로 한산한 시간 파악
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2B2D] bg-[#1A1B1D] mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2024 동네 재활 헬스장. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-[#01B395] hover:underline transition-colors">
                개인정보 처리방침
              </Link>
              <Link href="/terms" className="hover:text-[#01B395] hover:underline transition-colors">
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

