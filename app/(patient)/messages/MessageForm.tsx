"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { sendMessage } from "@/actions/message"
import { Send } from "lucide-react"
import { useRouter } from "next/navigation"

const messageSchema = z.object({
  content: z.string().min(1, "메시지를 입력해주세요"),
})

type MessageFormValues = z.infer<typeof messageSchema>

interface MessageFormProps {
  receiverId: string
}

export function MessageForm({ receiverId }: MessageFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  })

  const onSubmit = async (data: MessageFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await sendMessage({
        receiverId,
        content: data.content,
      })

      if (result.error) {
        alert(`메시지 전송 실패: ${result.error}`)
      } else {
        form.reset()
        router.refresh()
      }
    } catch (error) {
      alert(`오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="메시지를 입력하세요..."
                  {...field}
                  rows={2}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}

