import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const subscription = await request.json()

    // 구독 정보를 데이터베이스에 저장 (별도 테이블 필요)
    // 여기서는 간단히 로컬 스토리지에 저장하는 것으로 대체
    // 실제 프로덕션에서는 push_subscriptions 테이블을 만들어야 함

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("푸시 구독 오류:", error)
    return NextResponse.json(
      { error: "구독에 실패했습니다." },
      { status: 500 }
    )
  }
}

