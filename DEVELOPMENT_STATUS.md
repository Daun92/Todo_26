# Catalyze 26 개발 현황 문서

> 최종 업데이트: 2025-12-15

---

## 1. 프로젝트 개요

**Catalyze 26**은 2026년 목표 달성을 위한 AI 네이티브 개인 성장 관리 웹앱입니다.

### 핵심 철학
- **인과관계 추적**: Trigger → Insight → Action → Outcome
- **온톨로지 기반**: 모든 데이터가 관계로 연결된 지식 그래프
- **회고 중심 설계**: 1년 후 "나의 성장을 가장 촉진시킨 자극은?" 질문에 답할 수 있는 구조
- **AI 네이티브**: Claude Haiku 4.5 API를 활용한 지능형 분석

---

## 2. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React + TypeScript | 18.x / 5.x |
| 빌드 도구 | Vite | 6.x |
| 스타일링 | Tailwind CSS | 4.x |
| 상태 관리 | Zustand | 5.x |
| 데이터 저장 | Dexie.js (IndexedDB) | 4.x |
| 차트 | Recharts | 2.x |
| 그래프 | D3.js | 7.x |
| AI | Claude Haiku 4.5 API | - |

---

## 3. 완료된 기능

### 3.1 코어 기능 (Phase 1)

#### 습관 트래커
- [x] 5가지 기본 습관 (걷기, 자세, 코어, 호흡, 명상)
- [x] 일일 체크 및 저장
- [x] GitHub 스타일 히트맵 시각화
- [x] 연속 기록 (Streak) 추적

#### 챌린지 시스템
- [x] 일간 챌린지 (기사 리뷰, 코드 리뷰, 프롬프트 실험, TIL)
- [x] 주간 챌린지 (논문/리포트 딥다이브)
- [x] 월간 챌린지 (서적 완독, 월간 회고)
- [x] 챌린지 완료 기록 및 인사이트 저장

#### 목표 관리
- [x] 3가지 핵심 역량 목표 (AI 프롬프팅, 프로젝트 리드, 기획/관리)
- [x] 전략 버전 관리 (변경 이유와 히스토리 보존)
- [x] 마일스톤 체크포인트
- [x] 레벨 평가 (1-10) 및 히스토리

#### 저널
- [x] 4가지 유형 (자유 메모, 자극 기록, 회고, 목표 메모)
- [x] 태그 시스템
- [x] 검색 및 필터링
- [x] 날짜별 그룹핑

#### 인사이트 대시보드
- [x] 습관 달성 추이 차트
- [x] 챌린지 완료 통계
- [x] 역량 레벨 변화 추적
- [x] 주간/월간 기간 전환

#### 성장 그래프
- [x] D3.js 기반 Force-directed 그래프
- [x] 목표-자극-인사이트-챌린지 노드 시각화
- [x] 드래그 및 줌 인터랙션
- [x] 노드 선택 및 정보 표시

### 3.2 AI 네이티브 기능 (Phase 2) ✅

#### Claude API 연동
- [x] `/src/lib/claude.ts` - API 래퍼 모듈
- [x] 브라우저 직접 호출 (CORS 헤더 포함)
- [x] API 키 로컬스토리지 관리
- [x] JSON 응답 파싱 및 에러 처리

#### 인터랙티브 진단 시스템
- [x] `/src/components/onboarding/DiagnosticFlow.tsx`
- [x] 4가지 카테고리 진단 (AI 프롬프팅, 프로젝트 리드, 기획, 습관)
- [x] 4가지 문제 유형 (단일선택, 복수선택, 자유텍스트, 프롬프트작성)
- [x] AI 기반 프롬프트 평가
- [x] 카테고리별 결과 요약 생성
- [x] 초기 레벨 자동 설정

#### 저널 AI 분석
- [x] 저널 저장 시 자동 분석
- [x] 무드 감지 (positive/neutral/challenging)
- [x] 에너지 레벨 추정
- [x] 핵심 인사이트 추출
- [x] AI 태그 제안 및 자동 병합
- [x] 목표 자동 연결
- [x] 코칭 메시지 토스트 표시

#### 주간/월간 AI 회고
- [x] `/src/pages/InsightsPage.tsx` - 회고 모달
- [x] 기간 데이터 수집 (습관, 챌린지, 저널)
- [x] 하이라이트 요약
- [x] 성장 포인트 식별
- [x] 패턴 발견
- [x] 다음 기간 제안
- [x] 격려 메시지

#### AI 코치 채팅
- [x] `/src/components/home/AICoach.tsx`
- [x] 플로팅 채팅 위젯
- [x] 컨텍스트 기반 개인화 (목표, 저널, 연속기록)
- [x] 제안 버튼
- [x] 실행 항목 표시
- [x] 최소화/닫기 기능

#### 인과관계 AI 분석
- [x] `/src/pages/GraphPage.tsx` - 분석 모달
- [x] 가장 영향력 있는 자극 식별
- [x] 성장 패턴 발견
- [x] 변곡점 (급성장 시점) 분석
- [x] 숨겨진 상관관계 발견
- [x] 성장 스토리 내러티브

#### 설정 페이지
- [x] `/src/pages/SettingsPage.tsx`
- [x] API 키 입력/테스트/저장/삭제
- [x] 다크모드 토글
- [x] 진단 결과 표시 및 재실시
- [x] 데이터 관리 (내보내기/가져오기/초기화 UI)

---

## 4. 프로젝트 구조

```
src/
├── components/
│   ├── home/
│   │   ├── AICoach.tsx          # AI 코치 채팅 위젯
│   │   ├── ChallengeSection.tsx
│   │   ├── HabitTracker.tsx
│   │   ├── Heatmap.tsx
│   │   ├── StreakCard.tsx
│   │   └── WeeklyChallenge.tsx
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── onboarding/
│   │   ├── DiagnosticFlow.tsx   # 진단 흐름 관리
│   │   ├── DiagnosticQuestion.tsx
│   │   ├── diagnosticQuestions.ts
│   │   └── index.ts
│   ├── settings/
│   │   ├── APIKeySettings.tsx   # API 키 관리 UI
│   │   └── index.ts
│   └── ui/                      # 공통 UI 컴포넌트
├── hooks/
│   ├── useChallenges.ts
│   ├── useGoals.ts
│   └── useHabits.ts
├── lib/
│   ├── ai-services.ts           # AI 서비스 함수들
│   ├── claude.ts                # Claude API 래퍼
│   ├── db.ts                    # Dexie.js 데이터베이스
│   └── utils.ts
├── pages/
│   ├── GoalsPage.tsx
│   ├── GraphPage.tsx            # + AI 인과관계 분석
│   ├── HomePage.tsx
│   ├── InsightsPage.tsx         # + AI 회고
│   ├── JournalPage.tsx          # + AI 분석
│   └── SettingsPage.tsx         # 새로 추가
├── stores/
│   └── useStore.ts              # + 온보딩 상태
├── types/
│   └── index.ts
├── App.tsx                      # + 온보딩 흐름
└── main.tsx
```

---

## 5. AI 서비스 함수 목록

`/src/lib/ai-services.ts`:

| 함수 | 설명 | 사용처 |
|------|------|--------|
| `evaluatePrompt()` | 프롬프트 작성 평가 | 진단 시스템 |
| `evaluateScenario()` | 시나리오 선택 평가 | 진단 시스템 |
| `generateDiagnosticSummary()` | 진단 결과 요약 | 진단 시스템 |
| `analyzeJournal()` | 저널 분석 | 저널 페이지 |
| `generateWeeklyReview()` | 주간/월간 회고 | 인사이트 페이지 |
| `chatWithCoach()` | AI 코치 대화 | AI 코치 위젯 |
| `analyzeCausality()` | 인과관계 분석 | 그래프 페이지 |
| `extractChallengeInsights()` | 챌린지 인사이트 추출 | (미연동) |

---

## 6. 남은 과업

### 6.1 필수 구현

| 우선순위 | 항목 | 설명 |
|----------|------|------|
| 🔴 높음 | 데이터 내보내기/가져오기 | JSON 형식 실제 구현 |
| 🔴 높음 | 미니멀 디자인 리팩토링 | 이모지 대신 타이포그래피 기반 |
| 🟡 중간 | 챌린지 AI 인사이트 연동 | `extractChallengeInsights()` 활용 |
| 🟡 중간 | 저널 상세보기/수정 | 현재 목록만 표시 |
| 🟡 중간 | 목표 전략 편집 UI | 전략 버전 관리 UI |

### 6.2 개선 사항

| 항목 | 설명 |
|------|------|
| 번들 크기 최적화 | 현재 ~840KB, 코드 스플리팅 필요 |
| AI 응답 캐싱 | 동일 요청 재사용 |
| 오프라인 지원 | Service Worker 추가 |
| 에러 바운더리 | AI 호출 실패 시 fallback |
| 로딩 상태 개선 | 스켈레톤 UI 통일 |

### 6.3 Phase 3 고려사항

| 항목 | 설명 |
|------|------|
| PWA 지원 | 설치 가능한 앱 |
| 알림 시스템 | 습관 리마인더, 챌린지 마감 |
| 클라우드 동기화 | Firebase/Supabase 연동 |
| 고급 회고 템플릿 | KPT, 5 Whys 등 |
| 커뮤니티 기능 | 목표 공유, 챌린지 참여 |

---

## 7. 알려진 이슈

1. **API 키 노출 위험**: 브라우저에서 직접 API 호출하므로 키가 네트워크 탭에 노출됨
   - 해결: 프록시 서버 도입 또는 사용자 고지

2. **다크모드 깜빡임**: 초기 로드 시 잠깐 라이트모드 표시
   - 해결: HTML에 인라인 스크립트로 초기화

3. **그래프 데이터 부족**: 새 사용자는 그래프가 비어있음
   - 해결: 샘플 데이터 또는 안내 메시지

---

## 8. 개발 가이드

### 로컬 실행
```bash
npm install
npm run dev
```

### 빌드
```bash
npm run build
npm run preview
```

### 커밋 컨벤션
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 포맷팅
refactor: 리팩토링
```

### AI 기능 테스트
1. 설정 페이지에서 Anthropic API 키 등록
2. 저널 작성하여 AI 분석 확인
3. 인사이트 페이지에서 AI 회고 생성
4. 그래프 페이지에서 인과관계 분석

---

## 9. 브랜치 정보

- **개발 브랜치**: `claude/goal-management-webapp-zqiVQ`
- **최신 커밋**: `feat: Add AI native features with Claude Haiku 4.5 integration`

---

## 10. 참고 자료

- [Claude API 문서](https://docs.anthropic.com/)
- [Dexie.js 문서](https://dexie.org/)
- [Tailwind CSS 문서](https://tailwindcss.com/)
- [D3.js 문서](https://d3js.org/)
