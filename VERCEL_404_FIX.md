# Vercel 404 오류 해결 가이드

## 문제: 404: NOT_FOUND 오류

이 오류는 배포를 찾을 수 없다는 의미입니다.

## 해결 방법

### 1단계: Vercel 대시보드 확인

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 목록에서 `rehab-app` 프로젝트 찾기
3. 프로젝트 클릭하여 상세 페이지로 이동

### 2단계: 배포 상태 확인

**배포 목록에서 확인할 사항:**
- ✅ **Ready** (초록색) - 배포 성공, 정상 작동
- ⏳ **Building** (노란색) - 배포 진행 중, 대기 필요
- ❌ **Error** (빨간색) - 배포 실패, 오류 확인 필요
- ⚠️ **Canceled** (회색) - 배포 취소됨

### 3단계: 올바른 URL 확인

배포가 성공했다면:
1. 프로젝트 상세 페이지에서 **"Domains"** 섹션 확인
2. 올바른 URL 확인:
   - Production: `https://rehab-app-xxxxx.vercel.app`
   - 또는 커스텀 도메인 (설정한 경우)

**주의:** URL이 `rehab-app-six.vercel.app`인데 배포가 없다면:
- 다른 프로젝트 이름일 수 있음
- 배포가 삭제되었을 수 있음

### 4단계: 배포가 실패한 경우

**배포 로그 확인:**
1. 실패한 배포 클릭
2. "Build Logs" 탭 확인
3. 오류 메시지 확인

**일반적인 오류:**
- 환경 변수 누락
- 빌드 오류
- 의존성 설치 실패

### 5단계: 새로 배포하기

배포가 없다면 다시 배포:

1. **GitHub에서 푸시:**
   ```bash
   git add .
   git commit -m "Fix: 배포 준비"
   git push
   ```

2. **또는 Vercel에서 수동 배포:**
   - 프로젝트 페이지에서 "Deployments" 탭
   - "Redeploy" 버튼 클릭

### 6단계: 환경 변수 확인

배포가 실패했다면 환경 변수 확인:

1. 프로젝트 → Settings → Environment Variables
2. 다음 변수들이 모두 설정되어 있는지 확인:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
   - `NEXT_PUBLIC_SITE_URL`

### 7단계: 프로젝트 이름 확인

URL이 `rehab-app-six.vercel.app`인데 배포가 없다면:

1. Vercel 대시보드에서 프로젝트 이름 확인
2. 올바른 프로젝트로 접속
3. 또는 새 프로젝트로 다시 배포

## 빠른 체크리스트

- [ ] Vercel 대시보드에 로그인했는가?
- [ ] 프로젝트가 존재하는가?
- [ ] 배포가 "Ready" 상태인가?
- [ ] 올바른 URL로 접속했는가?
- [ ] 환경 변수가 모두 설정되어 있는가?
- [ ] 최근에 코드를 푸시했는가?

## 추가 도움말

- [Vercel 공식 문서 - 404 오류](https://vercel.com/docs/errors/404)
- [Vercel 배포 가이드](https://vercel.com/docs/deployments/overview)

