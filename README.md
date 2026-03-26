# 노무세무 통합 원툴 ERP (MVP 데모)

이 프로젝트는 사용자가 제공한 설계를 바탕으로 구축한 Next.js 기반 초안입니다.

## 주요 특징

- 고객사 포털 라우트: `/portal/{tenantSlug}/...`
  - 대시보드
  - 직원명부 / 직원 상세(문서·계약·연차·세무·요청 탭)
  - 요청(티켓) 목록/상세
  - 계약, 연차, 세무, 파일함, 리포트, 컨설팅
- 내부 운영 라우트: `/app/...`
  - 인박스
  - 요청함(템플릿 적용 버튼)
  - 템플릿 관리
  - 고객사 관리
  - 로그/발송이력
- 템플릿 문안 세트: `lib/templates.ts`
- 요청 유형별 자동 업무 미리보기: `lib/workflow.ts`의 `autoGenerateWorkTasks`

## 실행 방법

```bash
npm install
npm run dev
```

데스크톱 브리지 에이전트는 별도 프로세스로 실행합니다.

```bash
cd bridge-agent
npm install
npm start
```

실행 후:

- 고객사 데모: `http://localhost:3000/`
- 내부 운영: `http://localhost:3000/app/inbox`

## 다음 단계

1. `lib/data.ts`의 목업 데이터를 Supabase/PostgreSQL 스키마로 교체
2. API 라우트(`/app/api/*`) 추가하여 요청 등록/댓글/문서 업로드/서명 상태 영구 반영
3. 내부 권한/역할 제어 및 감사로그를 데이터베이스 기반으로 이관
