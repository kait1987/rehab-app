# 카카오맵 지도 로딩 문제 해결 가이드

## 🔍 문제 진단

지도가 로드되지 않는 경우 다음을 순서대로 확인하세요.

## ✅ 체크리스트

### 1. Vercel 환경 변수 확인

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 이동
4. 다음 변수가 **모든 환경**에 설정되어 있는지 확인:
   - `NEXT_PUBLIC_KAKAO_MAP_API_KEY` (JavaScript 키)

**중요:**
- 변수 이름이 정확히 일치해야 함 (대소문자 구분)
- **Production, Preview, Development** 모두에 설정
- 값은 카카오 개발자 콘솔의 **JavaScript 키** (REST API 키 아님)

### 2. 카카오 개발자 콘솔 도메인 등록 ⚠️ 가장 중요!

1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 내 애플리케이션 선택
3. **앱 설정** → **플랫폼** 메뉴로 이동
4. **Web 플랫폼 등록** 클릭
5. 다음 도메인들을 **각각 별도로** 추가:

```
https://rehab-app-opal.vercel.app
https://*.vercel.app
http://localhost:3000
```

**주의사항:**
- `https://`로 시작해야 함
- 끝에 `/` 없이 입력
- 와일드카드 `*.vercel.app`는 모든 Vercel 서브도메인 허용
- 여러 도메인은 각각 별도로 추가

### 3. API 키 확인

1. 카카오 개발자 콘솔 → **앱 키** 메뉴
2. **JavaScript 키** 확인 (REST API 키 아님!)
3. 이 키가 Vercel 환경 변수와 정확히 일치하는지 확인

### 4. 배포 재시도

환경 변수나 도메인을 변경한 경우:

1. Vercel 대시보드 → **Deployments** 탭
2. 최신 배포에서 **"..."** → **Redeploy** 클릭
3. 또는 GitHub에 푸시하여 자동 재배포

## 🔧 브라우저 콘솔 확인

배포된 사이트에서:

1. **F12** 또는 **우클릭 → 검사**로 개발자 도구 열기
2. **Console** 탭 확인
3. 오류 메시지 확인:

| 오류 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| `Kakao Map API 키가 설정되지 않았습니다` | 환경 변수 미설정 | Vercel 환경 변수 추가 |
| `Failed to load Kakao Map script` | 도메인 미등록 또는 API 키 오류 | 카카오 개발자 콘솔에 도메인 등록 |
| `CORS error` 또는 `Access denied` | 도메인 미등록 | 플랫폼 설정에서 도메인 확인 |
| `Kakao Map 스크립트 로드 타임아웃` | 네트워크 문제 또는 도메인 미등록 | 도메인 등록 및 네트워크 확인 |

4. **Network** 탭에서 `dapi.kakao.com` 요청 확인:
   - 상태 코드가 `200`인지 확인
   - `403` 또는 `404`면 도메인 미등록 가능성

## 🚀 개선된 기능

최신 코드에는 다음 개선사항이 포함되어 있습니다:

1. **자동 재시도**: 스크립트 로드 실패 시 최대 3회 자동 재시도
2. **상세한 에러 메시지**: 문제 해결 방법을 포함한 명확한 안내
3. **타임아웃 증가**: 15초로 증가하여 느린 네트워크 환경 대응
4. **도메인 정보 표시**: 현재 도메인을 에러 메시지에 포함

## 📝 빠른 확인 명령어

로컬에서 테스트:

```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_KAKAO_MAP_API_KEY

# 빌드 테스트
npm run build
npm run start
```

## 🆘 여전히 안 되면

1. **브라우저 캐시 삭제**: Ctrl+Shift+Delete (또는 Cmd+Shift+Delete)
2. **시크릿 모드에서 테스트**: 캐시 문제 제외
3. **다른 브라우저에서 테스트**: 브라우저별 문제 확인
4. **카카오 개발자 콘솔 로그 확인**: API 사용량 및 오류 로그 확인

## 📞 추가 도움말

- [카카오맵 API 가이드](https://apis.map.kakao.com/web/guide/)
- [카카오 개발자 콘솔](https://developers.kakao.com)
- [Vercel 환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

