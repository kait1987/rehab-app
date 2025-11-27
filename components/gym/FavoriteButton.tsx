"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleFavorite } from "@/actions/favorite"

interface FavoriteButtonProps {
  gymId: string
  userId: string
}

export function FavoriteButton({ gymId, userId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkFavorite()
  }, [gymId, userId])

  const checkFavorite = async () => {
    // localStorage에서 즐겨찾기 확인
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setIsFavorite(favorites.includes(gymId))
    setIsLoading(false)
  }

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const result = await toggleFavorite({ gymId, userId })
      if (result.success) {
        setIsFavorite(result.isFavorite || false)
        // localStorage도 업데이트
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
        if (result.isFavorite) {
          favorites.push(gymId)
        } else {
          const index = favorites.indexOf(gymId)
          if (index > -1) favorites.splice(index, 1)
        }
        localStorage.setItem("favorites", JSON.stringify(favorites))
      }
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Button variant="ghost" size="sm" disabled>...</Button>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={isFavorite ? "text-red-500" : ""}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
    </Button>
  )
}

