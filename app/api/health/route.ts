import { NextResponse } from 'next/server'
import { validateSupabaseEnv } from '@/lib/supabase/utils'

export async function GET() {
  const validation = validateSupabaseEnv()
  
  if (!validation.valid) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: validation.error,
        missing: validation.missing 
      },
      { status: 500 }
    )
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 간단한 쿼리로 연결 테스트
    const { error } = await supabase.from('gyms').select('id').limit(1)
    
    if (error) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Supabase 연결은 되지만 데이터베이스 쿼리에 실패했습니다.',
          error: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Supabase 연결 성공',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Supabase 연결 실패',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

