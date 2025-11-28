"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Bell } from "lucide-react"

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // 브라우저가 알림을 지원하는지 확인
    if ("Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true)

      // 알림 권한이 없는 경우 프롬프트 표시
      if (Notification.permission === "default") {
        // 사용자가 페이지를 몇 번 방문한 후에만 프롬프트 표시
        const hasSeenPrompt = localStorage.getItem("notification-prompt-seen")
        if (!hasSeenPrompt) {
          setTimeout(() => {
            setShowPrompt(true)
          }, 3000) // 3초 후 표시
        }
      }
    }
  }, [])

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        // Service Worker 등록
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("Service Worker registered:", registration)

          // 푸시 구독
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          })

          // 서버에 구독 정보 전송
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          })

          alert("알림이 활성화되었습니다!")
        }
      } else {
        alert("알림 권한이 거부되었습니다.")
      }

      localStorage.setItem("notification-prompt-seen", "true")
      setShowPrompt(false)
    } catch (error) {
      console.error("알림 활성화 실패:", error)
      alert("알림 활성화에 실패했습니다.")
    }
  }

  const handleDismiss = () => {
    localStorage.setItem("notification-prompt-seen", "true")
    setShowPrompt(false)
  }

  if (!isSupported || !showPrompt) {
    return null
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            운동 알림 받기
          </DialogTitle>
          <DialogDescription>
            운동 시간 알림을 받으시면 재활운동을 놓치지 않고 꾸준히 수행할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleDismiss}>
            나중에
          </Button>
          <Button onClick={handleEnableNotifications}>
            알림 활성화
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

