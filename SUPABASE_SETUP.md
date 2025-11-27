# Supabase 프로젝트 재설정 가이드

## 문제 상황
Supabase 404 에러가 발생하는 경우, 프로젝트가 삭제되었거나 환경 변수가 잘못 설정되었을 수 있습니다.

## 해결 방법

### 1단계: Supabase 프로젝트 생성/확인

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. **New Project** 클릭하여 새 프로젝트 생성
   - 프로젝트 이름: `rehab-app` (또는 원하는 이름)
   - 데이터베이스 비밀번호 설정 (기억해두세요!)
   - 리전 선택 (가장 가까운 리전 권장)
   - 프로젝트 생성 완료까지 2-3분 대기

### 2단계: API 키 확인

프로젝트 생성 후:

1. **Settings** → **API** 메뉴로 이동
2. 다음 정보 확인:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3단계: 환경 변수 설정

프로젝트 루트의 `.env` 파일을 열고 다음 값들을 업데이트하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
NEXT_PUBLIC_KAKAO_CLIENT_SECRET=your_kakao_client_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**중요**: 
- `NEXT_PUBLIC_SUPABASE_URL`에는 `https://` 포함
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 `anon` `public` 키 사용 (secret key 아님!)

### 4단계: 데이터베이스 스키마 설정

1. Supabase 대시보드에서 **SQL Editor** 메뉴로 이동
2. **New Query** 클릭
3. `lib/db/schema.sql` 파일의 전체 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행
5. 성공 메시지 확인

### 5단계: 초기 데이터 추가 (선택사항)

1. SQL Editor에서 **New Query** 클릭
2. `lib/db/seed.sql` 파일의 전체 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭하여 실행
4. 헬스장, 운동 템플릿 등 초기 데이터가 추가됩니다

### 6단계: 개발 서버 재시작

환경 변수를 변경했으므로 개발 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

### 7단계: 연결 확인

브라우저에서 `http://localhost:3000`을 열어 확인하세요.

## 문제 해결

### 여전히 404 에러가 발생하는 경우:

1. **환경 변수 확인**
   - `.env` 파일이 프로젝트 루트에 있는지 확인
   - 변수 이름에 오타가 없는지 확인 (`NEXT_PUBLIC_` 접두사 필수)
   - URL에 `https://`가 포함되어 있는지 확인

2. **Supabase 프로젝트 상태 확인**
   - Supabase 대시보드에서 프로젝트가 활성 상태인지 확인
   - 프로젝트가 일시 중지되었는지 확인 (무료 플랜은 일정 기간 비활성 시 일시 중지됨)

3. **브라우저 캐시 삭제**
   - 브라우저 캐시 및 쿠키 삭제
   - 시크릿 모드에서 테스트

4. **개발 서버 완전 재시작**
   ```bash
   # .next 폴더 삭제 후 재시작
   rm -rf .next
   npm run dev
   ```

## 추가 참고사항

- Supabase 무료 플랜은 일정 기간 비활성 시 프로젝트가 일시 중지될 수 있습니다
- 프로젝트가 일시 중지된 경우 대시보드에서 **Restore** 버튼을 클릭하여 복구할 수 있습니다
- 데이터베이스 비밀번호를 잊어버린 경우 프로젝트를 재생성해야 합니다

