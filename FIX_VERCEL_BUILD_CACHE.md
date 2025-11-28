# Vercel 빌드 캐시 문제 해결

## 문제
`(main)` route group을 제거했는데도 Vercel 빌드에서 계속 에러가 발생합니다:
```
Error: ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/app/(main)/page_client-reference-manifest.js'
```

## 원인
Vercel의 빌드 캐시에 이전 버전의 파일 정보가 남아있을 수 있습니다.

## 해결 방법

### 방법 1: Deployments에서 캐시 없이 재배포 (가장 확실한 방법)

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Deployments** 탭 클릭
4. 최신 배포(또는 실패한 배포)의 **"..." 메뉴** 클릭
5. **"Redeploy"** 선택
6. **"Use existing Build Cache" 체크박스를 해제** (중요!)
7. "Redeploy" 버튼 클릭

이렇게 하면 빌드 캐시를 사용하지 않고 완전히 새로 빌드합니다.

### 방법 2: Vercel CLI 사용 (로컬에서)

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 로그인
vercel login

# 프로젝트 디렉토리에서
vercel --force

# 또는 특정 배포 삭제 후 재배포
vercel remove
vercel
```

### 방법 3: Git에 빈 커밋 푸시 (강제 재배포)

```bash
# 빈 커밋 생성
git commit --allow-empty -m "Force rebuild - clear cache"

# 푸시
git push
```

### 방법 4: 프로젝트 설정에서 빌드 명령어 수정

1. Settings → General
2. Build & Development Settings
3. Build Command를 임시로 수정:
   ```
   rm -rf .next && npm run build
   ```
4. 저장 후 재배포
5. 원래대로 복구

### 방법 5: 환경 변수로 캐시 무시

Settings → Environment Variables에 추가:
- Key: `VERCEL_FORCE_NO_BUILD_CACHE`
- Value: `1`

## Git에서 확인

로컬에서 다음 명령어로 `(main)` 폴더가 정말 제거되었는지 확인:

```bash
# 모든 파일 확인
git ls-files | grep "(main)"

# app 폴더 구조 확인
ls -la app/

# .next 폴더 확인 (Git에 포함되지 않아야 함)
git ls-files | grep ".next"
```

## 로컬에서 빌드 테스트

```bash
# 빌드 캐시 삭제
rm -rf .next

# 깨끗한 빌드
npm run build
```

로컬에서 빌드가 성공하면 코드 문제가 아닙니다.

## 확인 사항

- [ ] `app/(main)` 폴더가 완전히 제거되었는가?
- [ ] `.gitignore`에 `.next/`가 포함되어 있는가?
- [ ] Git에 `(main)` 관련 파일이 남아있지 않은가?
- [ ] Deployments에서 "Use existing Build Cache"를 해제하고 재배포했는가?

