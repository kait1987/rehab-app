"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(formData: {
  receiverId: string
  programId?: string
  content: string
  imageUrl?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  // 메시지 전송 권한 확인 (환자는 담당 치료사에게만, 치료사는 자신의 환자에게만)
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (senderProfile?.role === "patient") {
    // 환자인 경우, 수신자가 자신의 담당 치료사인지 확인
    const { data: patient } = await supabase
      .from("patients")
      .select("therapist_id")
      .eq("id", user.id)
      .single()

    if (!patient || patient.therapist_id !== formData.receiverId) {
      return { error: "권한이 없습니다." }
    }
  } else if (senderProfile?.role === "therapist") {
    // 치료사인 경우, 수신자가 자신의 환자인지 확인
    const { data: receiverPatient } = await supabase
      .from("patients")
      .select("therapist_id")
      .eq("id", formData.receiverId)
      .single()

    if (!receiverPatient || receiverPatient.therapist_id !== user.id) {
      return { error: "권한이 없습니다." }
    }
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: formData.receiverId,
      program_id: formData.programId || null,
      content: formData.content,
      image_url: formData.imageUrl || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/patient/messages")
  revalidatePath("/therapist/messages")
  return { success: true, data }
}

export async function getMessages(conversationUserId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  let query = supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (*),
      receiver:profiles!messages_receiver_id_fkey (*)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (conversationUserId) {
    query = query.or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${conversationUserId}),and(sender_id.eq.${conversationUserId},receiver_id.eq.${user.id})`
    )
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

export async function markAsRead(messageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  // 메시지 수신자 확인
  const { data: message } = await supabase
    .from("messages")
    .select("receiver_id")
    .eq("id", messageId)
    .single()

  if (!message || message.receiver_id !== user.id) {
    return { error: "권한이 없습니다." }
  }

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/patient/messages")
  revalidatePath("/therapist/messages")
  return { success: true }
}

export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "인증이 필요합니다." }
  }

  // 대화 상대 목록 가져오기
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (*),
      receiver:profiles!messages_receiver_id_fkey (*)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (!messages) {
    return { success: true, data: [] }
  }

  // 대화 상대별로 그룹화
  const conversations = new Map()

  messages.forEach((message) => {
    const otherUserId =
      message.sender_id === user.id ? message.receiver_id : message.sender_id
    const otherUser =
      message.sender_id === user.id ? message.receiver : message.sender

    if (!conversations.has(otherUserId)) {
      conversations.set(otherUserId, {
        userId: otherUserId,
        userName: otherUser?.name || "이름 없음",
        lastMessage: message.content,
        lastMessageTime: message.created_at,
        unreadCount: 0,
      })
    }

    // 읽지 않은 메시지 수 계산
    if (
      message.receiver_id === user.id &&
      !message.read_at &&
      !conversations.get(otherUserId).unreadCount
    ) {
      const unreadCount = messages.filter(
        (m) =>
          m.sender_id === otherUserId &&
          m.receiver_id === user.id &&
          !m.read_at
      ).length
      conversations.get(otherUserId).unreadCount = unreadCount
    }
  })

  return {
    success: true,
    data: Array.from(conversations.values()).sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
    ),
  }
}

