"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getReviews } from "@/actions/review"
import { Review } from "@/types"
import { MessageSquare, Plus } from "lucide-react"
import { ReviewForm } from "./ReviewForm"

interface GymReviewsProps {
  gymId: string
}

export function GymReviews({ gymId }: GymReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [gymId])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const result = await getReviews(gymId)
      if (result.success && result.data) {
        setReviews(result.data)
      }
    } catch (error) {
      console.error("리뷰 로드 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewSubmit = () => {
    setShowForm(false)
    loadReviews()
  }

  // 태그별 집계
  const tagCounts: Record<string, number> = {}
  reviews.forEach((review) => {
    review.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return (
    <div className="space-y-4">
      {/* 태그 집계 */}
      {Object.keys(tagCounts).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => (
              <Badge key={tag} variant="secondary">
                {tag} ({count})
              </Badge>
            ))}
        </div>
      )}

      {/* 리뷰 작성 버튼 */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? (
          <>
            <MessageSquare className="h-4 w-4 mr-2" />
            리뷰 작성 취소
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            리뷰 작성하기
          </>
        )}
      </Button>

      {/* 리뷰 작성 폼 */}
      {showForm && (
        <ReviewForm gymId={gymId} onSubmit={handleReviewSubmit} />
      )}

      {/* 리뷰 목록 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-600">로딩 중...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {review.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {review.comment && (
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString("ko-KR")}
                  {review.is_admin_review && (
                    <span className="ml-2 text-blue-600">운영자</span>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

