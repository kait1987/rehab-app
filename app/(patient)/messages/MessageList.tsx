"use client"

import { useEffect, useState } from "react"
import { getMessages } from "@/actions/message"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MessageListProps {
  conversationUserId: string
}

export function MessageList({ conversationUserId }: MessageListProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 5000) // 5초마다 새로고침
    return () => clearInterval(interval)
  }, [conversationUserId])

  const loadMessages = async () => {
    const result = await getMessages(conversationUserId)
    if (result.success && result.data) {
      setMessages(result.data.reverse()) // 최신 메시지가 아래에 오도록
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        메시지가 없습니다. 첫 메시지를 보내보세요!
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

