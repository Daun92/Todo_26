# Phase 6: 안정화 및 품질 향상 - 상세 개발 계획

> 작성일: 2025-12-23
> 예상 기간: 2-3 스프린트
> 우선순위: 🔴 높음 (필수)

---

## 1. Phase 6 개요

### 1.1 목표
- 기존 기능의 버그 수정 및 안정화
- 사용자 경험(UX) 개선
- 코드 품질 및 성능 최적화
- 기술 부채 해소

### 1.2 범위
```
┌─────────────────────────────────────────────────────────────┐
│                      Phase 6 범위                            │
├─────────────────────────────────────────────────────────────┤
│  Sprint 1: 버그 수정 & 기능 완성                              │
│  ├── 태그 삭제 연쇄 처리                                      │
│  ├── 콘텐츠 상세 뷰 구현                                      │
│  └── 큐 상태 관리 개선                                        │
├─────────────────────────────────────────────────────────────┤
│  Sprint 2: UX 개선                                           │
│  ├── 드래그앤드롭 학습 큐                                     │
│  ├── 스켈레톤 로딩 UI                                         │
│  └── 에러 핸들링 강화                                         │
├─────────────────────────────────────────────────────────────┤
│  Sprint 3: 성능 최적화                                        │
│  ├── 번들 사이즈 최적화                                       │
│  ├── 컴포넌트 메모이제이션                                    │
│  └── 테스트 기반 구축                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Sprint 1: 버그 수정 & 기능 완성

### 2.1 태그 삭제 연쇄 처리

**현재 상태:**
```typescript
// src/hooks/useTags.ts:143-153
const deleteTag = useCallback(async (id: string): Promise<void> => {
  try {
    await db.tags.delete(id);
    setError(null);
    // TODO(CP-1.2): 연관된 콘텐츠/메모에서도 태그 제거 필요
  } catch (err) {
    setError(err as Error);
    throw err;
  }
}, []);
```

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 2.1.1 | 태그 ID로 연관 콘텐츠 조회 함수 추가 | `src/lib/db.ts` |
| 2.1.2 | 태그 ID로 연관 메모 조회 함수 추가 | `src/lib/db.ts` |
| 2.1.3 | deleteTag 함수에 연쇄 삭제 로직 추가 | `src/hooks/useTags.ts` |
| 2.1.4 | 삭제 확인 다이얼로그 개선 | 신규: `DeleteTagConfirm.tsx` |

**상세 구현:**

```typescript
// db.ts에 추가할 함수
export async function getContentsByTag(tagId: string): Promise<Content[]> {
  return db.contents.filter(c => c.tags.includes(tagId)).toArray();
}

export async function getMemosByTag(tagId: string): Promise<Memo[]> {
  return db.memos.filter(m => m.tags.includes(tagId)).toArray();
}

export async function removeTagFromContents(tagId: string): Promise<void> {
  const contents = await getContentsByTag(tagId);
  await Promise.all(
    contents.map(c =>
      db.contents.update(c.id, {
        tags: c.tags.filter(t => t !== tagId)
      })
    )
  );
}

export async function removeTagFromMemos(tagId: string): Promise<void> {
  const memos = await getMemosByTag(tagId);
  await Promise.all(
    memos.map(m =>
      db.memos.update(m.id, {
        tags: m.tags.filter(t => t !== tagId)
      })
    )
  );
}
```

```typescript
// useTags.ts deleteTag 개선
const deleteTag = useCallback(async (id: string): Promise<void> => {
  try {
    // 1. 연관 콘텐츠에서 태그 제거
    await removeTagFromContents(id);

    // 2. 연관 메모에서 태그 제거
    await removeTagFromMemos(id);

    // 3. 태그 삭제
    await db.tags.delete(id);

    setError(null);
  } catch (err) {
    setError(err as Error);
    throw err;
  }
}, []);
```

**테스트 케이스:**
- [ ] 태그 삭제 시 연관 콘텐츠에서 태그 제거 확인
- [ ] 태그 삭제 시 연관 메모에서 태그 제거 확인
- [ ] 다른 태그에는 영향 없음 확인
- [ ] 에러 발생 시 롤백 확인

---

### 2.2 콘텐츠 상세 뷰 구현

**현재 상태:**
```typescript
// src/pages/FeedPage.tsx:67-70
const handleContentClick = (content: { id: string }) => {
  setCurrentContentId(content.id);
  // TODO(CP-1.8): 콘텐츠 상세 모달 또는 페이지로 이동
};
```

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 2.2.1 | ContentDetailModal 컴포넌트 생성 | 신규: `ContentDetailModal.tsx` |
| 2.2.2 | 모달 등록 및 연동 | `src/App.tsx` |
| 2.2.3 | FeedPage에서 모달 열기 | `src/pages/FeedPage.tsx` |
| 2.2.4 | 콘텐츠 편집 기능 통합 | `ContentDetailModal.tsx` |

**ContentDetailModal 구조:**

```
┌─────────────────────────────────────────┐
│ ─ 콘텐츠 제목                    [X] 닫기 │
├─────────────────────────────────────────┤
│                                         │
│ 📌 상태: 대기 중 / 학습 중 / 완료        │
│                                         │
│ 🔗 URL (클릭 시 새 탭)                   │
│                                         │
│ 📝 내용/요약                             │
│ ─────────────────────────────────────   │
│ Lorem ipsum dolor sit amet...           │
│                                         │
│ 🏷️ 태그                                  │
│ [경제] [투자] [주식]                     │
│                                         │
│ ⚖️ 대척점 (있는 경우)                    │
│ ─────────────────────────────────────   │
│ 반대 관점 내용...                        │
│                                         │
│ 📊 AI 요약 (생성 버튼)                   │
│                                         │
├─────────────────────────────────────────┤
│ [삭제]          [편집]   [학습 시작 ▶]   │
└─────────────────────────────────────────┘
```

**주요 기능:**
1. 콘텐츠 전체 정보 표시
2. AI 요약 생성/표시
3. 대척점 표시 (있는 경우)
4. 편집 모드 전환
5. 학습 시작 버튼
6. 삭제 기능

---

### 2.3 큐 상태 관리 개선

**현재 상태:**
```typescript
// src/hooks/useContents.ts:435
removeFromQueue: moveToQueue, // NOTE: 실제로는 상태 변경이 필요할 수 있음
```

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 2.3.1 | removeFromQueue 함수 분리 구현 | `src/hooks/useContents.ts` |
| 2.3.2 | 큐 순서 저장 기능 추가 | `src/lib/db.ts` |
| 2.3.3 | 큐 아이템 순서 필드 추가 | `src/types/index.ts` |

**상세 구현:**

```typescript
// Content 타입에 queueOrder 추가
interface Content {
  // ... 기존 필드
  queueOrder?: number; // 큐에서의 순서 (optional)
}

// useContents.ts에 추가
const removeFromQueue = useCallback(async (id: string): Promise<void> => {
  // 큐에서 제거 = 상태를 변경하지 않고 queueOrder만 제거
  await db.contents.update(id, { queueOrder: undefined });
}, []);

const reorderQueue = useCallback(async (orderedIds: string[]): Promise<void> => {
  await Promise.all(
    orderedIds.map((id, index) =>
      db.contents.update(id, { queueOrder: index })
    )
  );
}, []);
```

---

## 3. Sprint 2: UX 개선

### 3.1 드래그앤드롭 학습 큐

**현재 상태:**
```typescript
// src/components/feed/LearningQueue.tsx:13
// 드래그앤드롭 순서 변경 (TODO: 향후 구현)
```

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 3.1.1 | @dnd-kit/core 패키지 설치 | `package.json` |
| 3.1.2 | DraggableQueueItem 컴포넌트 생성 | 신규: `DraggableQueueItem.tsx` |
| 3.1.3 | LearningQueue에 드래그 로직 통합 | `LearningQueue.tsx` |
| 3.1.4 | 순서 변경 시 DB 저장 | `useContents.ts` |

**필요 패키지:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**구현 구조:**

```typescript
// LearningQueue.tsx 구조
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function LearningQueue({ queue, onReorder, ...props }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = queue.findIndex(q => q.id === active.id);
      const newIndex = queue.findIndex(q => q.id === over.id);
      const newOrder = arrayMove(queue, oldIndex, newIndex);
      onReorder(newOrder.map(q => q.id));
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={queue.map(q => q.id)} strategy={verticalListSortingStrategy}>
        {queue.map(content => (
          <SortableQueueItem key={content.id} content={content} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

**UI 피드백:**
- 드래그 시 아이템 들어올림 효과 (elevation)
- 드롭 가능 위치 표시
- 드래그 핸들 아이콘 (☰)
- 순서 변경 완료 시 토스트 알림

---

### 3.2 스켈레톤 로딩 UI

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 3.2.1 | Skeleton 기본 컴포넌트 생성 | 신규: `Skeleton.tsx` |
| 3.2.2 | FeedCardSkeleton 생성 | `FeedCard.tsx` |
| 3.2.3 | KnowledgeGraphSkeleton 생성 | `KnowledgeGraph.tsx` |
| 3.2.4 | ReflectionReportSkeleton 생성 | `ReflectionReport.tsx` |
| 3.2.5 | 각 페이지에 스켈레톤 적용 | 각 페이지 파일 |

**Skeleton 컴포넌트:**

```typescript
// src/components/ui/Skeleton.tsx
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-tertiary)]',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-shimmer',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        variant === 'text' && 'rounded',
        className
      )}
      style={{ width, height }}
    />
  );
}
```

**페이지별 스켈레톤:**

```
FeedPage:
┌─────────────────────────────────────┐
│ ████████  ██████                    │  ← 헤더 스켈레톤
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐       │  ← 빠른 추가 버튼
│ │ ░░░░░ │ │ ░░░░░ │ │ ░░░░░ │       │
│ └───────┘ └───────┘ └───────┘       │
├─────────────────────────────────────┤
│ ████  학습 대기열  [██]             │
│ ┌────────┐ ┌────────┐ ┌────────┐    │
│ │ ░░░░░░ │ │ ░░░░░░ │ │ ░░░░░░ │    │
│ └────────┘ └────────┘ └────────┘    │
└─────────────────────────────────────┘
```

---

### 3.3 에러 핸들링 강화

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 3.3.1 | ErrorBoundary 컴포넌트 생성 | 신규: `ErrorBoundary.tsx` |
| 3.3.2 | Toast 알림 시스템 구현 | 신규: `Toast.tsx`, `useToast.ts` |
| 3.3.3 | API 에러 통합 핸들러 | 신규: `error-handler.ts` |
| 3.3.4 | 각 훅에 일관된 에러 처리 적용 | 각 훅 파일 |

**Toast 시스템:**

```typescript
// useToast.ts
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}));
```

**에러 메시지 표준화:**

| 에러 유형 | 사용자 메시지 | 액션 |
|-----------|---------------|------|
| 네트워크 오류 | "연결에 실패했습니다. 다시 시도해주세요." | 재시도 버튼 |
| API 키 없음 | "AI 기능을 사용하려면 API 키를 설정해주세요." | 설정 링크 |
| 저장 실패 | "저장에 실패했습니다. 다시 시도해주세요." | 재시도 버튼 |
| 삭제 실패 | "삭제에 실패했습니다." | 확인 |
| 알 수 없는 오류 | "문제가 발생했습니다. 잠시 후 다시 시도해주세요." | 확인 |

---

## 4. Sprint 3: 성능 최적화

### 4.1 번들 사이즈 최적화

**현재 상태:**
```
dist/assets/index-C7bbpEt3.js   931.31 kB │ gzip: 281.71 kB
⚠️ 500KB 권장치 초과
```

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 4.1.1 | Vite 빌드 설정 최적화 | `vite.config.ts` |
| 4.1.2 | 동적 임포트 적용 (페이지 단위) | 각 페이지 |
| 4.1.3 | D3.js 트리쉐이킹 | `KnowledgeGraph.tsx` |
| 4.1.4 | Recharts 최적화 | `StatsCharts.tsx` |

**Vite 설정 최적화:**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 벤더 청크 분리
          'vendor-react': ['react', 'react-dom'],
          'vendor-d3': ['d3'],
          'vendor-recharts': ['recharts'],
          // 기능별 청크
          'feature-connect': [
            './src/components/connect/KnowledgeGraph.tsx',
            './src/components/connect/PatternList.tsx',
          ],
          'feature-reflect': [
            './src/components/reflect/StatsCharts.tsx',
            './src/components/reflect/GrowthTimeline.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

**동적 임포트 적용:**

```typescript
// App.tsx
const ConnectPage = lazy(() => import('./pages/ConnectPage'));
const ReflectPage = lazy(() => import('./pages/ReflectPage'));

function AppContent() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {activeTab === 'connect' && <ConnectPage />}
      {activeTab === 'reflect' && <ReflectPage />}
    </Suspense>
  );
}
```

**예상 결과:**
- 초기 로드: ~300KB (현재 931KB에서 감소)
- Connect 페이지: ~200KB (필요 시 로드)
- Reflect 페이지: ~150KB (필요 시 로드)

---

### 4.2 컴포넌트 메모이제이션

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 4.2.1 | FeedCard memo 적용 | `FeedCard.tsx` |
| 4.2.2 | ConnectionCard memo 적용 | `ConnectionCard.tsx` |
| 4.2.3 | useMemo/useCallback 감사 | 전체 훅 |
| 4.2.4 | React DevTools 프로파일링 | - |

**메모이제이션 체크리스트:**

```typescript
// 패턴 1: 컴포넌트 memo
const FeedCard = memo(function FeedCard({ content, onStartLearning }: Props) {
  // ...
});

// 패턴 2: 콜백 메모이제이션
const handleClick = useCallback(() => {
  onStartLearning(content.id);
}, [onStartLearning, content.id]);

// 패턴 3: 계산값 메모이제이션
const sortedContents = useMemo(() => {
  return [...contents].sort((a, b) => /* ... */);
}, [contents]);
```

---

### 4.3 테스트 기반 구축

**구현 계획:**

| 작업 | 설명 | 파일 |
|------|------|------|
| 4.3.1 | Vitest + RTL 설치 | `package.json` |
| 4.3.2 | 테스트 설정 파일 | `vitest.config.ts` |
| 4.3.3 | 훅 테스트 작성 (우선순위) | `__tests__/hooks/` |
| 4.3.4 | 컴포넌트 테스트 작성 | `__tests__/components/` |

**필요 패키지:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**테스트 우선순위:**

| 우선순위 | 대상 | 이유 |
|----------|------|------|
| P0 | useContents | 핵심 데이터 CRUD |
| P0 | useTags | 태그 삭제 연쇄 로직 |
| P1 | useConnections | 그래프 데이터 변환 |
| P1 | useReflections | 통계 계산 |
| P2 | UI 컴포넌트 | 사용자 인터랙션 |

**예시 테스트:**

```typescript
// __tests__/hooks/useTags.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTags } from '@/hooks/useTags';

describe('useTags', () => {
  it('should delete tag and remove from contents', async () => {
    const { result } = renderHook(() => useTags());

    // Setup: create tag and content with tag
    await act(async () => {
      await result.current.addTag('test-tag');
    });

    // Action: delete tag
    await act(async () => {
      await result.current.deleteTag('tag-id');
    });

    // Assert: tag removed from contents
    expect(result.current.tags).not.toContainEqual(
      expect.objectContaining({ name: 'test-tag' })
    );
  });
});
```

---

## 5. 작업 체크리스트

### Sprint 1 체크리스트
- [ ] **2.1 태그 삭제 연쇄 처리**
  - [ ] 2.1.1 db.ts 헬퍼 함수 추가
  - [ ] 2.1.2 useTags.ts deleteTag 개선
  - [ ] 2.1.3 삭제 확인 다이얼로그 개선
  - [ ] 2.1.4 테스트 작성

- [ ] **2.2 콘텐츠 상세 뷰**
  - [ ] 2.2.1 ContentDetailModal 컴포넌트 생성
  - [ ] 2.2.2 App.tsx 모달 등록
  - [ ] 2.2.3 FeedPage 연동
  - [ ] 2.2.4 편집 기능 통합

- [ ] **2.3 큐 상태 관리**
  - [ ] 2.3.1 Content 타입에 queueOrder 추가
  - [ ] 2.3.2 reorderQueue 함수 구현
  - [ ] 2.3.3 removeFromQueue 로직 개선

### Sprint 2 체크리스트
- [ ] **3.1 드래그앤드롭**
  - [ ] 3.1.1 @dnd-kit 패키지 설치
  - [ ] 3.1.2 SortableQueueItem 컴포넌트
  - [ ] 3.1.3 LearningQueue 통합
  - [ ] 3.1.4 순서 저장 연동

- [ ] **3.2 스켈레톤 UI**
  - [ ] 3.2.1 Skeleton 기본 컴포넌트
  - [ ] 3.2.2 페이지별 스켈레톤 적용

- [ ] **3.3 에러 핸들링**
  - [ ] 3.3.1 ErrorBoundary 구현
  - [ ] 3.3.2 Toast 시스템 구현
  - [ ] 3.3.3 에러 메시지 표준화

### Sprint 3 체크리스트
- [ ] **4.1 번들 최적화**
  - [ ] 4.1.1 Vite 설정 최적화
  - [ ] 4.1.2 동적 임포트 적용
  - [ ] 4.1.3 벤더 청크 분리

- [ ] **4.2 메모이제이션**
  - [ ] 4.2.1 핵심 컴포넌트 memo 적용
  - [ ] 4.2.2 useCallback/useMemo 감사

- [ ] **4.3 테스트**
  - [ ] 4.3.1 Vitest 설정
  - [ ] 4.3.2 핵심 훅 테스트 작성

---

## 6. 성공 지표

| 지표 | 현재 | 목표 |
|------|------|------|
| 번들 크기 | 931KB | < 500KB (초기 로드) |
| TODO 항목 | 4개 | 0개 |
| 테스트 커버리지 | 0% | > 50% (훅) |
| 로딩 UX | 기본 | 스켈레톤 UI |
| 에러 처리 | console.error | Toast + 재시도 |

---

## 7. 의존성 추가

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "@dnd-kit/utilities": "^3.x"
  },
  "devDependencies": {
    "vitest": "^1.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "jsdom": "^24.x"
  }
}
```

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 방안 |
|--------|------|-----------|
| 드래그앤드롭 모바일 호환성 | 중 | touch-action CSS, 터치 이벤트 테스트 |
| 동적 임포트 사용자 경험 | 저 | 프리로드 힌트, 스켈레톤 UI |
| 테스트 작성 시간 | 중 | 핵심 로직 우선, 점진적 확대 |
| IndexedDB 마이그레이션 | 저 | Dexie 버전 관리, 마이그레이션 스크립트 |

---

*Phase 6 완료 후 Phase 8 (PWA) 진행 권장*
