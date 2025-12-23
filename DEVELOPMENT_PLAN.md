# MOSAIC 개발 계획서

> 작성일: 2025-12-23
> 버전: 1.0

---

## 1. 현재 상태 요약

### 1.1 완료된 Phase

| Phase | 이름 | 상태 | 완료일 |
|-------|------|------|--------|
| Phase 1 | Feed (발견) | ✅ 완료 | 2025-12-22 |
| Phase 2 | Learn (학습) | ✅ 완료 | 2025-12-22 |
| Phase 3 | Connect (연결) | ✅ 완료 | 2025-12-22 |
| Phase 4 | Reflect (회고) | ✅ 완료 | 2025-12-22 |
| Phase 5 | AI 기능 강화 | ✅ 완료 | 2025-12-22 |

### 1.2 현재 구현된 기능

#### Feed (발견)
- [x] 콘텐츠 CRUD (useContents 훅)
- [x] 학습 큐 관리 (LearningQueue)
- [x] 피드 카드 UI (FeedCard)
- [x] 태그 시스템 (useTags 훅)
- [x] AI 요약 카드 (AISummaryCard)

#### Learn (학습)
- [x] 인터뷰 세션 (InterviewSession)
- [x] AI 인터뷰 (useAIInterview)
- [x] 메모 시스템 (useMemos, MemoEditor)
- [x] 학습 진행 상태 (LearningProgress)

#### Connect (연결)
- [x] 지식 그래프 (KnowledgeGraph - D3.js)
- [x] 연결 데이터 모델 (useConnections)
- [x] 패턴 분석 (PatternList, AIPatternAnalysis)
- [x] 연결 카드 UI (ConnectionCard)

#### Reflect (회고)
- [x] 회고 리포트 (ReflectionReport)
- [x] 성장 타임라인 (GrowthTimeline)
- [x] 편향 분석 (BiasAnalysis)
- [x] 통계 차트 (StatsCharts)
- [x] AI 성장 스토리 (AIGrowthStory)

#### AI 기능
- [x] Gemini REST API 연동 (ai-service.ts)
- [x] Gemini Live API 실시간 대화 (gemini-live.ts)
- [x] 콘텐츠 요약/대척점 생성
- [x] 패턴 분석/연결 제안
- [x] 성장 스토리 생성

---

## 2. 코드베이스 내 TODO 항목

### 2.1 우선순위 높음 (P0)

| ID | 파일 | 내용 | 복잡도 |
|----|------|------|--------|
| TODO-1 | useTags.ts:148 | 태그 삭제 시 연관된 콘텐츠/메모에서도 태그 제거 | 중 |
| TODO-2 | FeedPage.tsx:69 | 콘텐츠 상세 모달 또는 페이지로 이동 | 중 |

### 2.2 우선순위 중간 (P1)

| ID | 파일 | 내용 | 복잡도 |
|----|------|------|--------|
| TODO-3 | InterviewSession.tsx:145 | 음성 녹음 기능 연동 | 고 |
| TODO-4 | LearningQueue.tsx:13 | 드래그앤드롭 순서 변경 | 중 |

### 2.3 개선 필요 사항

| ID | 파일 | 내용 | 복잡도 |
|----|------|------|--------|
| NOTE-1 | useContents.ts:435 | removeFromQueue 상태 변경 로직 개선 | 저 |

---

## 3. Phase 6: 안정화 및 품질 향상

### 3.1 개요
기존 기능의 안정화 및 사용자 경험 개선에 집중

### 3.2 작업 목록

#### 3.2.1 버그 수정 및 코드 개선
```
우선순위: P0
예상 복잡도: 중
```

| 작업 | 설명 | 관련 파일 |
|------|------|-----------|
| 태그 삭제 시 연쇄 정리 | 태그 삭제 시 콘텐츠/메모에서 해당 태그 제거 | useTags.ts |
| 콘텐츠 상세 뷰 구현 | 콘텐츠 클릭 시 상세 정보 모달/페이지 | FeedPage.tsx, AddContentModal.tsx |
| 큐 상태 관리 개선 | removeFromQueue 로직 정리 | useContents.ts |

#### 3.2.2 UX 개선
```
우선순위: P1
예상 복잡도: 중
```

| 작업 | 설명 | 관련 파일 |
|------|------|-----------|
| 학습 큐 드래그앤드롭 | 학습 순서 변경 기능 | LearningQueue.tsx |
| 로딩 상태 개선 | 스켈레톤 UI 추가 | 전체 페이지 |
| 에러 핸들링 강화 | 사용자 친화적 에러 메시지 | 전체 훅 |

#### 3.2.3 성능 최적화
```
우선순위: P1
예상 복잡도: 중
```

| 작업 | 설명 | 관련 파일 |
|------|------|-----------|
| 번들 사이즈 최적화 | 코드 스플리팅, 동적 임포트 | vite.config.ts |
| 그래프 렌더링 최적화 | D3.js 성능 개선 | KnowledgeGraph.tsx |
| 메모이제이션 적용 | 불필요한 리렌더링 방지 | 전체 컴포넌트 |

---

## 4. Phase 7: 음성 및 멀티미디어

### 4.1 개요
음성 입력/출력 기능 추가로 접근성 및 사용 편의성 향상

### 4.2 작업 목록

#### 4.2.1 음성 녹음 기능
```
우선순위: P1
예상 복잡도: 고
```

| 작업 | 설명 | 관련 파일 |
|------|------|-----------|
| 음성 녹음 UI | 녹음 버튼 및 파형 시각화 | InterviewSession.tsx |
| Web Audio API 연동 | 브라우저 음성 녹음 | audio-recorder.ts |
| 음성→텍스트 변환 | Gemini 또는 Whisper API | ai-service.ts |

#### 4.2.2 TTS (Text-to-Speech)
```
우선순위: P2
예상 복잡도: 중
```

| 작업 | 설명 |
|------|------|
| AI 질문 음성 출력 | Web Speech API 활용 |
| 음성 설정 옵션 | 속도, 음성 선택 |

---

## 5. Phase 8: PWA 및 오프라인

### 5.1 개요
Progressive Web App 구현으로 네이티브 앱 수준의 경험 제공

### 5.2 작업 목록

#### 5.2.1 PWA 기본 설정
```
우선순위: P1
예상 복잡도: 중
```

| 작업 | 설명 |
|------|------|
| Service Worker 설정 | Workbox 기반 캐싱 전략 |
| Web App Manifest | 앱 아이콘, 이름, 테마 색상 |
| 설치 프롬프트 | A2HS (Add to Home Screen) UI |

#### 5.2.2 오프라인 지원 강화
```
우선순위: P1
예상 복잡도: 중
```

| 작업 | 설명 |
|------|------|
| 오프라인 표시기 | 네트워크 상태 UI |
| 큐 동기화 | 온라인 복귀 시 동기화 |
| 캐시 관리 UI | 저장 공간 관리 |

---

## 6. Phase 9: 클라우드 동기화

### 6.1 개요
여러 기기 간 데이터 동기화 지원

### 6.2 작업 목록

#### 6.2.1 인증 시스템
```
우선순위: P0
예상 복잡도: 고
```

| 작업 | 설명 | 기술 옵션 |
|------|------|-----------|
| 로그인/회원가입 | OAuth 소셜 로그인 | Firebase Auth, Supabase |
| 세션 관리 | 토큰 관리 | JWT |
| 프로필 관리 | 사용자 설정 | - |

#### 6.2.2 데이터 동기화
```
우선순위: P0
예상 복잡도: 고
```

| 작업 | 설명 | 기술 옵션 |
|------|------|-----------|
| 백엔드 API | RESTful API | Supabase, Firebase |
| 충돌 해결 | Last-write-wins 또는 CRDT | - |
| 실시간 동기화 | WebSocket 기반 | Supabase Realtime |

---

## 7. Phase 10: 알림 시스템

### 7.1 개요
학습 리마인더 및 인사이트 알림

### 7.2 작업 목록

```
우선순위: P2
예상 복잡도: 중
```

| 작업 | 설명 |
|------|------|
| Push 알림 설정 | Web Push API |
| 알림 스케줄링 | 학습 리마인더 |
| 인앱 알림 | 패턴 발견, 회고 제안 |
| 알림 설정 UI | 알림 종류별 on/off |

---

## 8. Phase 11: 데이터 관리

### 8.1 개요
데이터 백업, 복원, 내보내기/가져오기

### 8.2 작업 목록

```
우선순위: P1
예상 복잡도: 중
```

| 작업 | 설명 |
|------|------|
| JSON 내보내기 | 전체 데이터 다운로드 |
| JSON 가져오기 | 데이터 복원 |
| Markdown 내보내기 | 학습 기록 문서화 |
| 선택적 내보내기 | 기간/태그별 필터 |

---

## 9. 개발 우선순위 매트릭스

### 9.1 중요도 vs 긴급도

```
            높은 긴급도                    낮은 긴급도
        ┌─────────────────────────────────────────────┐
높은    │  Phase 6 (안정화)      │  Phase 8 (PWA)      │
중요도  │  - 태그 삭제 정리      │  Phase 9 (동기화)   │
        │  - 콘텐츠 상세 뷰      │                     │
        ├─────────────────────────────────────────────┤
낮은    │  Phase 7 (음성)        │  Phase 10 (알림)    │
중요도  │  - 드래그앤드롭        │  Phase 11 (데이터)  │
        └─────────────────────────────────────────────┘
```

### 9.2 권장 개발 순서

```
1. Phase 6: 안정화 및 품질 향상 (필수)
   ↓
2. Phase 8: PWA 및 오프라인 (사용자 경험)
   ↓
3. Phase 11: 데이터 관리 (안전성)
   ↓
4. Phase 7: 음성 및 멀티미디어 (기능 확장)
   ↓
5. Phase 9: 클라우드 동기화 (확장성)
   ↓
6. Phase 10: 알림 시스템 (참여도)
```

---

## 10. 기술 부채 목록

### 10.1 현재 기술 부채

| 항목 | 위치 | 심각도 | 설명 |
|------|------|--------|------|
| 번들 크기 | 빌드 | 중 | 931KB (500KB 권장 초과) |
| 타입 안정성 | hooks/*.ts | 저 | 일부 any 타입 사용 |
| 테스트 부재 | 전체 | 고 | 단위/통합 테스트 없음 |
| 접근성 | UI | 중 | ARIA 라벨 부족 |

### 10.2 해결 계획

| 항목 | 해결 방안 | Phase |
|------|-----------|-------|
| 번들 크기 | 동적 임포트, 코드 스플리팅 | 6 |
| 타입 안정성 | strict 타입 검사 | 6 |
| 테스트 부재 | Vitest + RTL 도입 | 6+ |
| 접근성 | WCAG 2.1 준수 | 7 |

---

## 11. 의존성 업데이트 계획

### 11.1 현재 주요 의존성

| 패키지 | 현재 버전 | 상태 |
|--------|-----------|------|
| React | 19.2.0 | ✅ 최신 |
| Vite | 7.x | ✅ 최신 |
| Tailwind CSS | 4.x | ✅ 최신 |
| Dexie.js | 4.2.1 | ✅ 최신 |
| D3.js | 7.9.0 | ✅ 최신 |

### 11.2 추가 권장 패키지

| 용도 | 패키지 | Phase |
|------|--------|-------|
| 드래그앤드롭 | @dnd-kit/core | 6 |
| PWA | vite-plugin-pwa | 8 |
| 테스트 | vitest, @testing-library/react | 6+ |
| 애니메이션 | framer-motion | 7 |

---

## 12. 마일스톤 요약

| Phase | 이름 | 핵심 목표 | 예상 작업량 |
|-------|------|-----------|-------------|
| 6 | 안정화 | 버그 수정, UX 개선, 성능 최적화 | 중 |
| 7 | 음성 | 음성 녹음, TTS | 고 |
| 8 | PWA | 오프라인 지원, 설치 가능 | 중 |
| 9 | 동기화 | 멀티 디바이스, 클라우드 | 고 |
| 10 | 알림 | Push 알림, 리마인더 | 중 |
| 11 | 데이터 | 내보내기/가져오기 | 저 |

---

## 부록 A: 파일 구조 현황

```
src/
├── components/
│   ├── ai/            # AI 관련 (AIOrb)
│   ├── connect/       # 연결 (KnowledgeGraph, PatternList 등)
│   ├── feed/          # 피드 (FeedCard, LearningQueue 등)
│   ├── layout/        # 레이아웃 (Header, BottomNav 등)
│   ├── learn/         # 학습 (InterviewSession, MemoEditor 등)
│   ├── modals/        # 모달 (AddContentModal, SettingsModal 등)
│   ├── reflect/       # 회고 (ReflectionReport, GrowthTimeline 등)
│   └── ui/            # 공통 UI (Button, Card, Modal 등)
├── hooks/             # 커스텀 훅 (useContents, useMemos 등)
├── lib/               # 유틸리티 (db, ai-service, gemini-live 등)
├── pages/             # 페이지 (FeedPage, LearnPage 등)
├── stores/            # Zustand 스토어
└── types/             # TypeScript 타입
```

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
