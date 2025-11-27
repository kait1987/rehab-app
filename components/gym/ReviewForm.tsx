"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { submitReview } from "@/actions/review"
import { Card, CardContent } from "@/components/ui/card"

const reviewSchema = z.object({
  tags: z.array(z.string()).min(1, "최소 1개 이상의 태그를 선택해주세요"),
  comment: z.string().max(200, "코멘트는 200자 이내로 입력해주세요").optional(),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  gymId: string
  onSubmit: () => void
}

const availableTags = [
  "조용함",
  "재활친화",
  "장비 깨끗함",
  "복잡함",
  "장비 오래됨",
  "PT/코치 좋음",
  "가격 합리적",
  "주차 편함",
]

export function ReviewForm({ gymId, onSubmit }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      tags: [],
      comment: "",
    },
  })

  const handleSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await submitReview({
        gymId,
        tags: data.tags,
        comment: data.comment,
      })

      if (result.error) {
        alert(`리뷰 작성 실패: ${result.error}`)
      } else {
        form.reset()
        onSubmit()
      }
    } catch (error) {
      alert(`오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTags = form.watch("tags")

  return (
    <Card>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label className="mb-2 block">태그 선택 (필수)</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-3 min-h-[44px]">
                    <Checkbox
                      id={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        const currentTags = form.getValues("tags")
                        if (checked) {
                          form.setValue("tags", [...currentTags, tag])
                        } else {
                          form.setValue(
                            "tags",
                            currentTags.filter((t) => t !== tag)
                          )
                        }
                      }}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={tag} className="cursor-pointer text-base flex-1">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
              {form.formState.errors.tags && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.tags.message}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <Label>코멘트 (선택)</Label>
                  <FormControl>
                    <Textarea
                      placeholder="리뷰 코멘트를 입력하세요 (최대 200자)"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "리뷰 등록"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

