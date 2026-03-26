# Bridge Agent

ERP 웹과 분리해서 실행하는 로컬 데스크톱 브리지 서버입니다.

## 기능

- `GET /health`: 에이전트 상태 확인
- `POST /jobs`: 홈택스, 4대보험, 묶음 수집 작업 등록
- `GET /jobs/:jobId`: 작업 상태 및 로그 확인
- `GET /files/*`: 생성 파일 정적 다운로드

현재 워커는 실제 기관 브라우저 자동화 대신, 테스트용 PDF 파일을 생성하는 최소 구현입니다.

## 실행

```bash
cd bridge-agent
npm install
npm start
```

기본 주소는 `http://127.0.0.1:43115` 입니다.

## 환경 변수

- `BRIDGE_PORT`: 기본값 `43115`
- `OUTPUT_DIR`: 기본값 `./downloads`

## 예시 요청

```bash
curl http://127.0.0.1:43115/health
```

```bash
curl -X POST http://127.0.0.1:43115/jobs ^
  -H "Content-Type: application/json" ^
  -d "{\"provider\":\"bundle\",\"company\":{\"name\":\"허장테스트\",\"bizNo\":\"198-86-01580\"}}"
```

응답으로 받은 `jobId`를 사용해 상태를 조회합니다.

```bash
curl http://127.0.0.1:43115/jobs/{jobId}
```
