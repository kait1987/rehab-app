# 🚀 빠른 배포 가이드 (5분 안에 배포하기)

## 준비사항

1. GitHub 계정
2. Vercel 계정 (GitHub로 가입 가능)
3. 프로젝트의 환경 변수 값들

---

## 단계별 가이드

### 1️⃣ GitHub에 코드 푸시 (2분)

터미널에서 실행:

```bash
# Git이 초기화되지 않았다면
git init
git add .
git commit -m "Ready for deployment"

# GitHub에 새 저장소 생성 후 (GitHub 웹사이트에서)
git remote add origin https://github.com/your-username/rehab-app.git
git branch -M main
git push -u origin main
```

**참고:** `.env` 파일은 Git에 포함하지 마세요! (`.gitignore`에 이미 포함되어 있음)

---

### 2️⃣ Vercel에 배포 (3분)

1. **Vercel 접속**
   - https://vercel.com 접속
   - "Sign Up" → GitHub로 로그인

2. **프로젝트 Import**
   - 대시보드에서 "Add New..." → "Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **환경 변수 설정** (중요!)
   
   프로젝트 설정 페이지에서 다음 변수들을 추가:
   
   | 변수 이름 | 설명 | 예시 |
   |---------|------|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 | `eyJhbGci...` |
   | `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | 카카오맵 JavaScript 키 | `xxxxxxxxxxxxx` |
   | `NEXT_PUBLIC_SITE_URL` | 배포 후 URL (나중에 설정 가능) | `https://your-app.vercel.app` |

   **설정 방법:**
   - 각 변수 입력 후 "Add" 클릭
   - **모든 환경** (Production, Preview, Development) 선택
   - `NEXT_PUBLIC_SITE_URL`은 배포 후 URL로 업데이트

4. **배포 실행**
   - "Deploy" 버튼 클릭
   - 2-3분 대기

5. **완료!**
   - 배포 완료 후 제공되는 URL로 접속
   - 예: `https://rehab-app-xxxxx.vercel.app`

---

### 3️⃣ 배포 후 확인

1. **사이트 접속**
   - 배포된 URL로 접속
   - 정상적으로 로드되는지 확인

2. **지도 테스트**
   - `/map` 페이지 접속
   - 지도가 정상적으로 표시되는지 확인

3. **환경 변수 업데이트**
   - Vercel 대시보드 → Settings → Environment Variables
   - `NEXT_PUBLIC_SITE_URL`을 실제 배포 URL로 업데이트
   - "Redeploy" 클릭

---

## 🔑 환경 변수 값 찾는 방법

### Supabase 값
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. Settings → API
4. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 카카오맵 API 키
1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 내 애플리케이션 선택
3. 앱 키 → **JavaScript 키** → `NEXT_PUBLIC_KAKAO_MAP_API_KEY`

**중요:** 카카오맵 API 키 설정에서 플랫폼에 **웹 도메인**을 추가해야 합니다:
- Vercel 배포 URL: `https://your-app.vercel.app`
- (선택) 로컬 테스트: `http://localhost:3000`

---

## ⚠️ 문제 해결

### 빌드 실패
```bash
# 로컬에서 먼저 테스트
npm run build
```

### 지도가 안 보임
- 카카오 개발자 콘솔에서 배포된 도메인을 플랫폼에 추가했는지 확인
- 환경 변수 `NEXT_PUBLIC_KAKAO_MAP_API_KEY`가 올바른지 확인

### Supabase 연결 오류
- Supabase 프로젝트가 활성 상태인지 확인
- URL과 키가 올바른지 확인 (끝에 `/` 없어야 함)

---

## 🎉 완료!

이제 배포된 사이트를 공유하고 테스트할 수 있습니다!

**다음 단계:**
- 커스텀 도메인 연결 (선택사항)
- Google Analytics 추가 (선택사항)
- 성능 모니터링 설정 (선택사항)

