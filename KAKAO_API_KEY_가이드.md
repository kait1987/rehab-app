# 카카오맵 API 키 찾는 방법 (상세 가이드)

## 📍 카카오 개발자 콘솔에서 API 키 확인하기

### 1단계: 카카오 개발자 콘솔 접속

1. 브라우저에서 [https://developers.kakao.com](https://developers.kakao.com) 접속
2. 카카오 계정으로 로그인 (없으면 회원가입 필요)

### 2단계: 내 애플리케이션 선택

1. 로그인 후 상단 메뉴에서 **"내 애플리케이션"** 클릭
   - 또는 직접 [https://developers.kakao.com/console/app](https://developers.kakao.com/console/app) 접속

2. 애플리케이션 목록에서 **재활 헬스장 앱** 선택
   - 만약 앱이 없다면 **"애플리케이션 추가하기"** 클릭하여 새로 생성

### 3단계: 앱 키 확인

1. 선택한 애플리케이션 페이지에서 왼쪽 메뉴 클릭:
   - **"앱 설정"** → **"앱 키"** 클릭
   - 또는 상단 탭에서 **"앱 키"** 탭 클릭

2. **JavaScript 키** 찾기
   - 여러 키가 표시됩니다:
     - REST API 키
     - JavaScript 키 ← **이것을 사용해야 합니다!**
     - Admin 키
     - Native App 키
   - **JavaScript 키** 옆에 있는 **"복사"** 버튼 클릭

### 4단계: Vercel에 환경 변수로 추가

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 (rehab-app)
3. **Settings** → **Environment Variables** 클릭
4. **"Add New"** 또는 **"Add"** 버튼 클릭
5. 다음 정보 입력:
   - **Key**: `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
   - **Value**: 복사한 JavaScript 키 붙여넣기
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - (모두 체크!)
6. **"Save"** 클릭

### 5단계: 플랫폼 설정 (도메인 등록)

**중요:** API 키만으로는 부족합니다! 도메인도 등록해야 합니다.

1. 카카오 개발자 콘솔로 돌아가기
2. 왼쪽 메뉴에서 **"앱 설정"** → **"플랫폼"** 클릭
3. **"Web 플랫폼 등록"** 클릭 (아직 없다면)
4. 다음 도메인들을 **각각 별도로** 추가:
   ```
   https://rehab-app-opal.vercel.app
   https://*.vercel.app
   http://localhost:3000
   ```
5. 각 도메인 입력 후 **"저장"** 클릭

### 6단계: 배포 재시도

1. Vercel 대시보드로 돌아가기
2. **Deployments** 탭 클릭
3. 최신 배포에서 **"..."** → **"Redeploy"** 클릭
4. 또는 GitHub에 푸시하여 자동 재배포

---

## 🔍 스크린샷으로 확인하기

### 앱 키 화면 예시

```
┌─────────────────────────────────────┐
│  앱 키                               │
├─────────────────────────────────────┤
│  REST API 키                         │
│  abc123def456...                    │
│  [복사]                              │
│                                      │
│  JavaScript 키  ← 이걸 사용!          │
│  xyz789uvw012...                    │
│  [복사]                              │
│                                      │
│  Admin 키                            │
│  ...                                 │
└─────────────────────────────────────┘
```

### 플랫폼 설정 화면 예시

```
┌─────────────────────────────────────┐
│  플랫폼                              │
├─────────────────────────────────────┤
│  Web 플랫폼                          │
│  ┌───────────────────────────────┐  │
│  │ https://rehab-app-opal...     │  │
│  │ https://*.vercel.app          │  │
│  │ http://localhost:3000         │  │
│  └───────────────────────────────┘  │
│  [Web 플랫폼 추가]                   │
└─────────────────────────────────────┘
```

---

## ⚠️ 주의사항

1. **JavaScript 키를 사용해야 합니다!**
   - REST API 키가 아닙니다
   - Admin 키도 아닙니다
   - 반드시 **JavaScript 키**를 사용하세요

2. **도메인 등록 필수!**
   - API 키만으로는 작동하지 않습니다
   - 반드시 플랫폼 설정에서 도메인을 등록해야 합니다

3. **환경 변수 이름 정확히!**
   - `NEXT_PUBLIC_KAKAO_MAP_API_KEY` (대소문자 정확히)

4. **모든 환경에 설정!**
   - Production, Preview, Development 모두에 설정

---

## 🆘 여전히 찾을 수 없나요?

### 앱이 없는 경우

1. 카카오 개발자 콘솔 → **"애플리케이션 추가하기"** 클릭
2. 앱 이름 입력 (예: "재활 헬스장 앱")
3. 저장 후 위의 3단계부터 진행

### JavaScript 키가 보이지 않는 경우

1. 앱 설정 → **"앱 키"** 탭 확인
2. 페이지를 새로고침
3. 다른 브라우저에서 시도
4. 카카오 계정 권한 확인

### 도움말

- [카카오 개발자 콘솔 가이드](https://developers.kakao.com/docs/latest/ko/getting-started/app-key)
- [카카오맵 API 가이드](https://apis.map.kakao.com/web/guide/)

