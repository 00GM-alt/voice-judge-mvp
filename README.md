# Voice Judge MVP (Next.js + Supabase)

사람들이 문장을 보고 녹음 업로드, 다른 사람들이 재생/평가(별점)+하트를 누르는 MVP입니다.

## 0) 필요한 것
- GitHub 계정
- Supabase 계정
- Vercel 계정 (배포용)

## 1) Supabase 준비 (10분)
1. 새 프로젝트 생성 후 **Project URL**과 **anon key**, **service_role** 키 확보
   - Project Settings → API에서 확인
2. SQL Editor에서 `supabase.sql` 파일 내용 전체 실행
3. Storage → 새 Bucket 생성: 이름 `recordings` (Public 권장)
4. Authentication → **Email OTP** 또는 **Social login(Google)** 활성화 (원하는 방식)

## 2) 로컬 실행 (선택)
```bash
npm i
cp .env.example .env.local
# .env.local에 Supabase 값 입력
npm run dev
```

## 3) Vercel로 배포
1. 이 레포를 GitHub에 올리고 Vercel에서 Import
2. Environment Variables에 다음 값 추가
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE
   - STORAGE_BUCKET=recordings
3. Deploy

## 4) 기능
- 홈: 녹음 리스트, 평균점수, 하트수, 재생
- 업로드: 문장 선택 → 브라우저 녹음 → 업로드
- 상세: 별점(1~5), 하트 토글, 신고

## 5) 보안/주의
- MVP이므로 RLS 미설정. 서비스 공개 전 RLS 및 정책 추가 권장.
- Storage를 Public으로 쓰면 URL이 외부에 노출됩니다.
- abuse 방지: rate limit은 추후 추가 권장.

