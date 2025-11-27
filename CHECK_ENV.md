# 환경 변수 확인 가이드

## 빠른 확인 방법

### 1. .env 파일 위치 확인
프로젝트 루트 디렉토리(`rehab-app`)에 `.env` 파일이 있는지 확인하세요.

### 2. .env 파일 내용 확인
`.env` 파일을 열고 다음 형식으로 작성되어 있는지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**중요 사항:**
- `NEXT_PUBLIC_SUPABASE_URL`은 반드시 `https://`로 시작해야 합니다
- URL 끝에 `/`가 있으면 제거하세요 (예: `https://xxxxx.supabase.co/` ❌ → `https://xxxxx.supabase.co` ✅)
- 공백이나 따옴표가 없어야 합니다
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 `anon` `public` 키를 사용하세요 (secret key 아님!)

### 3. 올바른 형식 예시

✅ **올바른 형식:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

❌ **잘못된 형식:**
```env
# 따옴표 사용 (불필요)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"

# 끝에 슬래시
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co/

# http 사용 (보안 문제)
NEXT_PUBLIC_SUPABASE_URL=http://xxxxx.supabase.co

# 공백 포함
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co

# 값이 비어있음
NEXT_PUBLIC_SUPABASE_URL=
```

### 4. Supabase 키 확인 방법

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **API** 메뉴로 이동
4. 다음 정보 확인:
   - **Project URL**: 이것이 `NEXT_PUBLIC_SUPABASE_URL` 값입니다
   - **anon public** 키: 이것이 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값입니다

### 5. 환경 변수 적용 확인

환경 변수를 변경한 후에는 **반드시 개발 서버를 재시작**해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

### 6. 연결 상태 확인

브라우저에서 다음 URL로 접속하여 연결 상태를 확인할 수 있습니다:
```
http://localhost:3000/api/health
```

성공하면:
```json
{
  "status": "ok",
  "message": "Supabase 연결 성공"
}
```

실패하면:
```json
{
  "status": "error",
  "message": "오류 메시지"
}
```

## 문제 해결

### 문제: "NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않습니다"

**해결 방법:**
1. `.env` 파일에서 `NEXT_PUBLIC_SUPABASE_URL` 값 확인
2. `https://`로 시작하는지 확인
3. 끝에 `/`가 있으면 제거
4. 공백이나 따옴표 제거
5. 개발 서버 재시작

### 문제: "Supabase 환경 변수가 설정되지 않았습니다"

**해결 방법:**
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 파일 이름이 정확히 `.env`인지 확인 (`.env.local`도 가능)
3. 변수 이름에 오타가 없는지 확인 (`NEXT_PUBLIC_` 접두사 필수)
4. 개발 서버 재시작

### 문제: Supabase 프로젝트가 404 에러를 반환

**해결 방법:**
1. Supabase 대시보드에서 프로젝트가 활성 상태인지 확인
2. 프로젝트가 일시 중지된 경우 "Restore" 버튼 클릭
3. URL이 올바른지 다시 확인

