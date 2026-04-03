# 성능개선 자동 연구 루프

이 저장소는 Karpathy의 `autoresearch` 개념을 제품 성능개선용으로 번역해 적용한다.

핵심 원칙은 단순하다.

1. 한 번에 한 병목만 잡는다.
2. 수정 전후를 같은 방식으로 측정한다.
3. 좋아진 변경만 남긴다.

## 기본 명령

```bash
npm run perf:hotspots
npm run perf:build
```

## 권장 루프

1. `npm run perf:hotspots`로 큰 파일과 의심 지점을 본다.
2. `npm run perf:build`로 현재 빌드 기준을 남긴다.
3. 화면 하나, 파일 하나, 가설 하나만 잡는다.
4. 수정한다.
5. `npm run build`로 검증한다.
6. 필요하면 `127.0.0.1:3100` 프리뷰에서 실제 체감을 확인한다.
7. 다시 `npm run perf:build`를 돌려 전후 차이를 비교한다.

## 현재 우선순위

- 관리자 인사노무 탭
- 대형 리스트/테이블 렌더 경로
- `WorkspaceDashboard.tsx`의 데이터 가공량
- 거대한 CSS 모듈과 중첩 패널 구조

## 결과 파일

`npm run perf:build`는 `perf-results/latest-build.json`을 생성한다.

이 파일은 다음 작업에서 기준점으로 재사용한다.
