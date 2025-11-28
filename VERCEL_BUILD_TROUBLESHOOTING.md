# Vercel 빌드 문제 해결 가이드

## ⚠️ 경고 vs 에러 구분하기

### 경고 (Warnings) - 빌드를 막지 않음
다음 메시지들은 **경고**이며, 빌드를 막지 않습니다:
- `npm warn deprecated rimraf@3.0.2`
- `npm warn deprecated inflight@1.0.6`
- `npm warn deprecated @humanwhocodes/config-array@0.13.0`
- `npm warn deprecated glob@7.2.3`
- `npm warn deprecated @humanwhocodes/object-schema@2.0.3`

이것들은 의존성 패키지의 하위 의존성에서 나오는 경고로, **무시해도 됩니다**.

### 실제 에러 확인 방법
빌드 로그에서 다음을 확인하세요:
- `Error:` 또는 `✖` 표시가 있는지
- 빌드가 `✓ Compiled successfully`로 끝나는지
- 마지막에 `Build completed` 또는 `Deployment ready`가 나오는지

## 🔍 빌드 실패 시 확인 사항

### 1. 실제 빌드 에러 확인
Vercel 빌드 로그의 **마지막 부분**을 확인하세요:
- `Error:`로 시작하는 메시지
- `Build failed` 또는 `Command "npm run build" exited with 1`

### 2. 로컬에서 빌드 테스트
```bash
# 로컬에서 빌드 테스트
npm run build
```

로컬에서 빌드가 성공하면 Vercel 설정 문제일 수 있습니다.

### 3. Vercel 설정 확인
Vercel 프로젝트 설정에서:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

### 4. 환경 변수 확인
Vercel 프로젝트 설정 → Environment Variables에서 다음이 설정되어 있는지 확인:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

### 5. Node.js 버전 확인
Vercel 프로젝트 설정 → General → Node.js Version:
- **권장**: 18.x 또는 20.x

### 6. 빌드 캐시 초기화
Vercel 대시보드에서:
1. 프로젝트 설정 → General
2. "Clear Build Cache" 클릭
3. 다시 배포

## 🛠️ 일반적인 해결 방법

### 방법 1: package.json에 engines 추가
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 방법 2: .npmrc 파일 생성
프로젝트 루트에 `.npmrc` 파일 생성:
```
legacy-peer-deps=false
```

### 방법 3: Vercel 빌드 로그 전체 확인
Vercel 대시보드 → Deployments → 실패한 배포 클릭 → Build Logs 전체 확인

## 📝 체크리스트

빌드가 실패하는 경우 다음을 확인하세요:

- [ ] 로컬에서 `npm run build` 성공하는가?
- [ ] Vercel 빌드 로그의 마지막 부분에 실제 에러가 있는가?
- [ ] 환경 변수가 모두 설정되어 있는가?
- [ ] Node.js 버전이 18 이상인가?
- [ ] route group 충돌이 없는가? (같은 경로를 가리키는 route group이 없는지 확인)
- [ ] `next.config.mjs`에 `output: 'standalone'`이 없는가?

## 💡 팁

1. **경고는 무시해도 됩니다**: `npm warn deprecated` 메시지는 빌드를 막지 않습니다.
2. **전체 로그 확인**: 빌드 로그의 처음이 아니라 **마지막 부분**을 확인하세요.
3. **로컬 테스트**: 로컬에서 빌드가 성공하면 코드 문제가 아닐 가능성이 높습니다.

