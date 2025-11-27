"use client"

import { useEffect, useState } from "react"
import { getMessages, markAsRead } from "@/actions/message"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TherapistMessageListProps {
  conversationUserId: string
}

export function TherapistMessageList({ conversationUserId }: TherapistMessageListProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [conversationUserId])

  useEffect(() => {
    // 읽지 않은 메시지 읽음 처리
    messages.forEach((message) => {
      if (!message.read_at && message.receiver_id !== conversationUserId) {
        markAsRead(message.id)
      }
    })
  }, [messages, conversationUserId])

  const loadMessages = async () => {
    const result = await getMessages(conversationUserId)
    if (result.success && result.data) {
      setMessages(result.data.reverse())
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        메시지가 없습니다.
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender_id === conversationUserId ? "justify-start" : "justify-end"
            }`}
          >
            {message.sender_id === conversationUserId && (
              <Avatar>
                <AvatarFallback>
                  {message.sender?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === conversationUserId
                  ? "bg-gray-100"
                  : "bg-blue-500 text-white"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.image_url && (
                <img
                  src={message.image_url}
                  alt="첨부 이미지"
                  className="mt-2 rounded max-w-full"
                />
              )}
              <p
                className={`text-xs mt-1 ${
                  message.sender_id === conversationUserId
                    ? "text-gray-500"
                    : "text-blue-100"
                }`}
              >
                {format(new Date(message.created_at), "MM월 dd일 HH:mm", {
                  locale: ko,
                })}
              </p>
            </div>
            {message.sender_id !== conversationUserId && (
              <Avatar>
                <AvatarFallback>나</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

