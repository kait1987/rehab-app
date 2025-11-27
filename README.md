# 동네 재활 헬스장 & 운동 코스 추천 서비스

동네에서 재활운동하기 좋은 헬스장을 찾고, 내 몸 상태에 맞는 재활 코스를 만드는 서비스입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: PostgreSQL (Supabase)
- **지도**: 카카오맵 API
- **UI 컴포넌트**: shadcn/ui

## 주요 기능

### 위치 기반 헬스장 검색
- 현재 위치 기준 1km 내 재활 친화 헬스장 검색
- 카카오맵 지도 표시
- 필터링 (조용함, 재활기구, 주차, 샤워실, PT/코치)
- 혼잡도 정보 (한산/보통/붐빔)

### 채팅형 재활 코스 추천
- 5개 질문으로 사용자 상태 파악
- 부위별/통증별/기구별 맞춤 코스 생성
- 90분 루틴 (준비운동-메인-마무리)
- 코스와 헬스장 자동 연동

### 태그 기반 리뷰 시스템
- 태그 선택형 리뷰 (조용함, 재활친화 등)
- 짧은 코멘트 작성
- 태그별 집계 표시

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 pnpm
- Supabase 계정
- 카카오맵 API 키

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd rehab-app
```

2. 의존성 설치
```bash
npm install
# 또는
pnpm install
```

3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
NEXT_PUBLIC_KAKAO_CLIENT_SECRET=your_kakao_client_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. 데이터베이스 설정

Supabase 대시보드의 SQL Editor에서 `lib/db/schema.sql` 파일의 내용을 실행하세요.

(선택) 초기 데이터를 추가하려면 `lib/db/seed.sql` 파일의 내용도 실행하세요.

5. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
rehab-app/
├── app/
│   ├── (main)/              # 메인 페이지
│   │   ├── page.tsx        # 홈
│   │   ├── map/            # 지도 검색
│   │   ├── gym/            # 헬스장 상세
│   │   └── onboarding/     # 온보딩
│   ├── (course)/           # 코스 생성
│   │   ├── create/         # 코스 생성 플로우
│   │   └── result/         # 코스 결과
│   └── api/                # API 라우트
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── gym/                # 헬스장 관련 컴포넌트
│   ├── course/             # 코스 관련 컴포넌트
│   ├── map/                # 지도 컴포넌트
│   └── shared/             # 공통 컴포넌트
├── lib/
│   ├── supabase/           # Supabase 클라이언트
│   ├── db/                 # 데이터베이스 스키마
│   └── kakao-map.ts           # 카카오맵 유틸리티
├── actions/                # Server Actions
├── types/                  # TypeScript 타입 정의
└── public/                 # 정적 파일
```

## 데이터베이스 스키마

주요 테이블:
- `gyms`: 헬스장/운동공간 정보
- `gym_facilities`: 헬스장 시설 정보
- `reviews`: 태그 기반 리뷰
- `gym_crowd_levels`: 혼잡도 정보
- `exercise_templates`: 재활운동 템플릿
- `user_courses`: 사용자가 생성한 코스
- `course_exercises`: 코스에 포함된 운동
- `favorites`: 즐겨찾기

자세한 스키마는 `lib/db/schema.sql`을 참조하세요.

## 카카오맵 API 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/)에서 앱 생성
2. JavaScript 키 발급
3. `.env.local`에 다음 변수 설정:
   - `NEXT_PUBLIC_KAKAO_MAP_API_KEY`: JavaScript 키
   - `NEXT_PUBLIC_KAKAO_CLIENT_SECRET`: REST API 키 (선택사항, 향후 REST API 사용 시 필요)
4. 플랫폼 설정에서 웹 도메인 등록

### Geocoding API 사용 (동네 검색 기능)

카카오맵 JavaScript API에는 Geocoding 기능이 내장되어 있어 별도 설정이 필요하지 않습니다. 동네 이름 검색 기능은 카카오맵 API 키만 있으면 사용할 수 있습니다.

## 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정 (Supabase, 카카오맵 API 키)
3. 배포

### 기타 플랫폼

Next.js를 지원하는 모든 플랫폼에서 배포 가능합니다.

## 라이선스

MIT
