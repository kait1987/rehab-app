import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateSupabaseEnv } from './utils'

export async function createClient() {
  const validation = validateSupabaseEnv()
  
  if (!validation.valid) {
    const errorMsg = validation.error || 'Supabase 설정 오류'
    console.error('Supabase 환경 변수 오류:', errorMsg)
    console.error('현재 설정된 값:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨 (길이: ' + process.env.NEXT_PUBLIC_SUPABASE_URL.length + ')' : '없음',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨 (길이: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : '없음',
    })
    throw new Error(errorMsg)
  }

  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()

  try {
    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (error) {
    console.error('Supabase 서버 클라이언트 생성 실패:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    throw new Error(`Supabase 연결에 실패했습니다: ${errorMessage}. 환경 변수를 확인하세요.`)
  }
}

