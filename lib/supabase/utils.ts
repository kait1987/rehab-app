// Supabase 환경 변수 검증 유틸리티

export function validateSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 환경 변수가 없는 경우
  if (!url || !key) {
    const missing = []
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!key) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    return {
      valid: false,
      error: `Supabase 환경 변수가 설정되지 않았습니다: ${missing.join(", ")}. .env 파일을 확인하세요.`,
      missing: {
        url: !url,
        key: !key,
      },
    }
  }

  // URL이 비어있거나 공백만 있는 경우
  if (url.trim() === "" || key.trim() === "") {
    return {
      valid: false,
      error: "Supabase 환경 변수가 비어있습니다. .env 파일에 올바른 값을 설정하세요.",
    }
  }

  // URL 형식 검증 (더 유연하게)
  const trimmedUrl = url.trim()
  if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
    return {
      valid: false,
      error: "NEXT_PUBLIC_SUPABASE_URL은 http:// 또는 https://로 시작해야 합니다.",
    }
  }

  // Supabase URL 패턴 확인 (더 유연하게)
  if (!trimmedUrl.includes("supabase") && !trimmedUrl.includes("localhost")) {
    console.warn("Supabase URL 형식이 일반적인 패턴과 다릅니다:", trimmedUrl.substring(0, 50))
    // 경고만 하고 계속 진행 (로컬 개발 환경일 수 있음)
  }

  return { valid: true }
}

