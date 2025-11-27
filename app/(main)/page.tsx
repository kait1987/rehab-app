import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Dumbbell, MessageSquare, Calendar } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">동네 재활 헬스장</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          동네에서 재활운동하기 좋은 헬스장을 찾고,
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          내 몸 상태에 맞는 90분 재활 코스를 만들어보세요
        </p>
      </section>

      {/* Main Features */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>내 주변 재활 헬스장 찾기</CardTitle>
              <CardDescription>
                현재 위치 기준 1km 내 재활운동하기 좋은 헬스장을 찾아보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/map">지도에서 찾기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Dumbbell className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>내 몸 상태로 재활 코스 만들기</CardTitle>
              <CardDescription>
                몇 가지 질문에 답하면 오늘 할 90분 재활 코스를 만들어드릴게요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="default">
                <Link href="/course/create">코스 만들기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-center mb-8">주요 기능</h3>
        <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <MapPin className="h-6 w-6 text-blue-600 mb-2" />
              <CardTitle className="text-lg">위치 기반 검색</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                현재 위치 기준 1km 내 재활 친화 헬스장 검색
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-6 w-6 text-green-600 mb-2" />
              <CardTitle className="text-lg">태그 리뷰</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                조용함, 재활친화 등 태그로 빠르게 정보 확인
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Dumbbell className="h-6 w-6 text-purple-600 mb-2" />
              <CardTitle className="text-lg">맞춤 코스</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                내 상태에 맞는 90분 재활 운동 코스 자동 생성
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-6 w-6 text-orange-600 mb-2" />
              <CardTitle className="text-lg">혼잡도 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                시간대별 예상 혼잡도로 한산한 시간 파악
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

