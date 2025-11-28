# 웹 배포 가이드

이 가이드는 Next.js 앱을 Vercel에 배포하는 방법을 설명합니다.

## 🚀 Vercel 배포 (추천)

Vercel은 Next.js를 만든 회사에서 제공하는 플랫폼으로, 가장 간단하고 빠르게 배포할 수 있습니다.

### 1단계: Vercel 계정 생성

1. [Vercel 웹사이트](https://vercel.com)에 접속
2. "Sign Up" 클릭
3. GitHub 계정으로 로그인 (권장) 또는 이메일로 가입

### 2단계: 프로젝트 준비

#### 2-1. Git 저장소에 푸시

먼저 프로젝트를 GitHub에 푸시해야 합니다:

```bash
# Git이 초기화되지 않았다면
git init
git add .
git commit -m "Initial commit"

# GitHub에 새 저장소 생성 후
git remote add origin https://github.com/your-username/rehab-app.git
git branch -M main
git push -u origin main
```

#### 2-2. .gitignore 확인

`.env` 파일이 Git에 포함되지 않도록 확인하세요:

```bash
# .gitignore 파일에 다음이 포함되어 있는지 확인
.env
.env.local
.env*.local
```

### 3단계: Vercel에 프로젝트 배포

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택 또는 Import
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `.next` (자동 설정됨)

### 4단계: 환경 변수 설정

Vercel 프로젝트 설정에서 환경 변수를 추가해야 합니다:

1. 프로젝트 설정 페이지에서 "Environment Variables" 섹션으로 이동
2. 다음 환경 변수들을 추가:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_KAKAO_MAP_API_KEY
NEXT_PUBLIC_SITE_URL
```

**중요 사항:**
- `NEXT_PUBLIC_SITE_URL`은 배포 후 생성되는 Vercel URL로 설정하세요 (예: `https://your-project.vercel.app`)
- 각 환경 변수에 대해 **모든 환경** (Production, Preview, Development)을 선택하세요
- 값은 `.env` 파일에서 복사하세요

### 5단계: 배포 실행

1. "Deploy" 버튼 클릭
2. 배포가 완료될 때까지 대기 (약 2-3분)
3. 배포 완료 후 제공되는 URL로 접속하여 확인

### 6단계: 배포 후 확인

1. 배포된 사이트에서 지도가 정상적으로 로드되는지 확인
2. Supabase 연결이 정상인지 확인 (`/api/health` 엔드포인트 확인)
3. 카카오맵 API 키가 올바르게 설정되었는지 확인

---

## 🔧 다른 배포 옵션

### Netlify

1. [Netlify](https://www.netlify.com)에 가입
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 연결
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. 환경 변수 설정 (Vercel과 동일)

### Railway

1. [Railway](https://railway.app)에 가입
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택
4. 환경 변수 설정
5. 자동 배포됨

---

## 📝 배포 전 체크리스트

- [ ] `.env` 파일이 Git에 포함되지 않았는지 확인
- [ ] 모든 환경 변수가 Vercel에 설정되었는지 확인
- [ ] `NEXT_PUBLIC_SITE_URL`이 배포 URL로 설정되었는지 확인
- [ ] Supabase 프로젝트가 활성 상태인지 확인
- [ ] 카카오맵 API 키가 올바른지 확인
- [ ] 로컬에서 `npm run build`가 성공하는지 확인

---

## 🐛 문제 해결

### 빌드 실패

```bash
# 로컬에서 빌드 테스트
npm run build
```

빌드 오류가 있다면 로컬에서 먼저 수정하세요.

### 환경 변수 오류

- Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
- 변수 이름에 오타가 없는지 확인 (`NEXT_PUBLIC_` 접두사 필수)
- 배포 후 환경 변수 변경 시 재배포 필요

### 지도가 로드되지 않음

- 카카오맵 API 키의 플랫폼 설정 확인
- 카카오 개발자 콘솔에서 배포된 도메인을 허용 목록에 추가

### Supabase 연결 오류

- Supabase 프로젝트가 일시 중지되지 않았는지 확인
- URL과 키가 올바른지 확인

---

## 🔄 자동 배포 설정

GitHub에 푸시할 때마다 자동으로 배포되도록 설정됩니다:

1. `main` 브랜치에 푸시 → Production 배포
2. 다른 브랜치에 푸시 → Preview 배포

---

## 📞 추가 도움말

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

