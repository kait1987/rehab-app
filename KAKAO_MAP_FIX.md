# 카카오맵 지도 로드 오류 해결 가이드

## 문제: "Kakao Map script not loaded yet"

배포된 웹사이트에서 지도가 로드되지 않는 경우 다음을 확인하세요.

## 해결 방법

### 1단계: Vercel 환경 변수 확인

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 이동
4. 다음 변수가 설정되어 있는지 확인:
   - `NEXT_PUBLIC_KAKAO_MAP_API_KEY`

**중요:**
- 변수 이름이 정확히 `NEXT_PUBLIC_KAKAO_MAP_API_KEY`인지 확인
- 값이 올바른 JavaScript 키인지 확인
- **모든 환경** (Production, Preview, Development)에 설정되어 있는지 확인

### 2단계: 카카오 개발자 콘솔 도메인 등록

**가장 중요한 단계입니다!**

1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 내 애플리케이션 선택
3. **앱 설정** → **플랫폼** 메뉴로 이동
4. **Web 플랫폼 등록** 클릭
5. 다음 도메인들을 추가:
   - `https://your-app.vercel.app` (실제 배포 URL)
   - `https://*.vercel.app` (모든 Vercel 서브도메인 허용)
   - `http://localhost:3000` (로컬 개발용, 선택사항)

**주의:**
- 도메인은 `https://`로 시작해야 함
- 끝에 `/` 없이 입력
- 여러 도메인은 각각 별도로 추가

### 3단계: API 키 확인

1. 카카오 개발자 콘솔 → **앱 키** 메뉴
2. **JavaScript 키** 확인
3. 이 키가 Vercel 환경 변수와 일치하는지 확인

### 4단계: 배포 재시도

환경 변수나 도메인을 변경한 경우:

1. Vercel 대시보드에서 **Deployments** 탭
2. 최신 배포에서 **Redeploy** 클릭
3. 또는 GitHub에 푸시하여 자동 재배포

### 5단계: 브라우저 콘솔 확인

배포된 사이트에서:

1. 브라우저 개발자 도구 열기 (F12)
2. **Console** 탭 확인
3. 오류 메시지 확인:
   - `Kakao Map API key is not set` → 환경 변수 미설정
   - `Failed to load Kakao Map script` → 도메인 미등록 또는 API 키 오류
   - `CORS error` → 도메인 미등록

## 체크리스트

- [ ] Vercel 환경 변수 `NEXT_PUBLIC_KAKAO_MAP_API_KEY` 설정됨
- [ ] 환경 변수가 **모든 환경**에 설정됨
- [ ] 카카오 개발자 콘솔에 배포 URL이 등록됨
- [ ] 카카오 개발자 콘솔에 `*.vercel.app` 도메인 등록됨
- [ ] JavaScript 키가 올바른지 확인됨
- [ ] 배포가 재시도됨

## 일반적인 오류 메시지

### "Kakao Map API 키가 설정되지 않았습니다"
→ Vercel 환경 변수에 `NEXT_PUBLIC_KAKAO_MAP_API_KEY` 추가

### "Failed to load Kakao Map script"
→ 카카오 개발자 콘솔에 도메인 등록 확인

### "CORS error" 또는 "Access denied"
→ 카카오 개발자 콘솔의 플랫폼 설정에서 도메인 확인

## 추가 도움말

- [카카오맵 API 가이드](https://apis.map.kakao.com/web/guide/)
- [카카오 개발자 콘솔](https://developers.kakao.com)

