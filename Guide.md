# Catalyze 26 설치 및 실행 가이드 (초심자용)

이 문서는 프로그래밍 경험이 없는 분들도 Catalyze 26을 설치하고 실행할 수 있도록 작성되었습니다.

---

## 사전 준비물

시작하기 전에 컴퓨터에 다음이 설치되어 있어야 합니다.

### 1. Node.js 설치

Node.js는 JavaScript를 실행할 수 있게 해주는 프로그램입니다.

**설치 방법:**
1. https://nodejs.org 접속
2. **LTS (Long Term Support)** 버전 다운로드 (초록색 버튼)
3. 설치 파일 실행 → 기본 옵션으로 "Next" 클릭하며 설치

**설치 확인:**
```bash
node --version   # v18.x.x 이상이면 OK
npm --version    # 9.x.x 이상이면 OK
```

### 2. Git 설치

Git은 코드 버전 관리 도구입니다.

**설치 방법:**
1. https://git-scm.com 접속
2. 운영체제에 맞는 버전 다운로드
3. 설치 (기본 옵션으로 진행)

**설치 확인:**
```bash
git --version    # git version 2.x.x 이상이면 OK
```

---

## 프로젝트 가져오기 (Clone)

### Step 1: 터미널 열기

| 운영체제 | 방법 |
|----------|------|
| **Windows** | `Win + R` → `cmd` 입력 → 엔터 |
| **Mac** | `Cmd + Space` → `터미널` 검색 → 엔터 |
| **Linux** | `Ctrl + Alt + T` |

### Step 2: 작업할 폴더로 이동

```bash
# 예: 바탕화면에 프로젝트를 받고 싶다면
cd Desktop
```

> 💡 **팁**: `cd`는 "change directory"의 약자로, 폴더를 이동하는 명령어입니다.

### Step 3: 저장소 클론 (복제)

```bash
git clone https://github.com/Daun92/Todo_26.git
```

이 명령어는:
- GitHub에서 프로젝트 전체를 다운로드합니다
- `Todo_26` 폴더가 생성됩니다

### Step 4: 프로젝트 폴더로 이동

```bash
cd Todo_26
```

### Step 5: 개발 브랜치로 전환

```bash
git checkout claude/goal-management-webapp-zqiVQ
```

이 명령어는:
- 실제 개발된 코드가 있는 브랜치로 이동합니다

> 💡 **브랜치란?** Git에서 독립적인 작업 공간을 의미합니다. 여러 버전의 코드를 관리할 수 있습니다.

---

## 의존성 설치 (npm install)

### Step 6: 패키지 설치

```bash
npm install
```

**이 명령어가 하는 일:**
1. `package.json` 파일을 읽습니다
2. 필요한 모든 라이브러리를 인터넷에서 다운로드합니다
3. `node_modules` 폴더에 저장합니다

**예상 결과:**
```
added 290 packages in 12s
```

> ⏱️ **시간이 걸립니다** (인터넷 속도에 따라 1-3분 정도)

---

## 개발 서버 실행

### Step 7: 앱 실행

```bash
npm run dev
```

**예상 결과:**
```
  VITE v7.x.x  ready in 500ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

> 💡 서버가 실행 중인 동안 터미널을 닫지 마세요!

### Step 8: 브라우저에서 확인

1. 웹 브라우저(Chrome, Firefox 등) 열기
2. 주소창에 입력: `http://localhost:5173`
3. 엔터!

**🎉 Catalyze 26 앱이 화면에 나타납니다!**

---

## 전체 명령어 요약

한 번에 복사해서 실행할 수 있는 명령어입니다:

```bash
# 1. 저장소 복제
git clone https://github.com/Daun92/Todo_26.git

# 2. 폴더 이동
cd Todo_26

# 3. 개발 브랜치 전환
git checkout claude/goal-management-webapp-zqiVQ

# 4. 패키지 설치
npm install

# 5. 개발 서버 실행
npm run dev

# 6. 브라우저에서 http://localhost:5173 접속
```

---

## 자주 쓰는 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 배포용 빌드 생성 |
| `npm run preview` | 빌드 결과 미리보기 |
| `Ctrl + C` | 서버 종료 (터미널에서) |

---

## 서버 종료 방법

터미널에서 `Ctrl + C`를 누르면 서버가 종료됩니다.

다시 시작하려면:
```bash
npm run dev
```

---

## 문제 해결 (Troubleshooting)

### "command not found: npm" 또는 "'npm'은(는) 내부 또는 외부 명령이 아닙니다"

**원인:** Node.js가 설치되지 않았습니다.

**해결:**
1. https://nodejs.org 에서 Node.js 설치
2. 터미널을 닫았다가 다시 열기
3. `node --version`으로 설치 확인

---

### "EACCES permission denied" (Mac/Linux)

**원인:** 권한 문제입니다.

**해결:**
```bash
sudo npm install
```
비밀번호 입력 후 진행

---

### "node_modules 폴더가 너무 큽니다"

**정상입니다!**
- 보통 200-300MB 정도 됩니다
- 이 폴더는 Git에 업로드되지 않습니다
- `.gitignore` 파일에서 제외되어 있습니다

---

### "포트 5173이 이미 사용 중입니다"

**원인:** 다른 터미널에서 이미 서버가 실행 중입니다.

**해결:**
1. 실행 중인 다른 터미널 찾기
2. `Ctrl + C`로 종료
3. 다시 `npm run dev` 실행

---

### "git clone이 안 됩니다"

**원인:** Git이 설치되지 않았거나 네트워크 문제입니다.

**해결:**
1. `git --version`으로 Git 설치 확인
2. 인터넷 연결 확인
3. GitHub URL이 정확한지 확인

---

### 화면이 이상하게 나옵니다

**해결:**
1. 브라우저 캐시 삭제 (`Ctrl + Shift + R` 또는 `Cmd + Shift + R`)
2. 다른 브라우저로 시도
3. 개발자 도구 콘솔에서 에러 메시지 확인 (`F12`)

---

## 앱 사용법

앱이 실행되면 하단 네비게이션 바로 페이지를 이동할 수 있습니다:

| 탭 | 아이콘 | 기능 |
|----|--------|------|
| **홈** | 🏠 | 오늘의 습관 체크, 일간/주간/월간 챌린지, 히트맵 |
| **목표** | 🎯 | 역량 목표 관리, 전략 수정, 마일스톤 체크 |
| **저널** | ✏️ | 자유 메모, 자극 기록, 회고 작성 |
| **인사이트** | 📊 | 습관 추이 차트, 챌린지 통계, 역량 변화 |
| **그래프** | 🔗 | 지식 그래프 시각화 (목표-자극-인사이트 연결) |

### 다크모드

우측 상단의 🌙/☀️ 버튼으로 다크모드를 전환할 수 있습니다.

---

## 데이터 저장 위치

모든 데이터는 **브라우저의 IndexedDB**에 저장됩니다.
- 서버에 저장되지 않습니다 (로컬 전용)
- 브라우저 데이터를 삭제하면 기록이 사라집니다
- 다른 브라우저나 기기와 동기화되지 않습니다

### 데이터 초기화가 필요한 경우

1. 브라우저 개발자 도구 열기 (`F12`)
2. **Application** 탭 클릭
3. 좌측 메뉴에서 **Storage → IndexedDB** 찾기
4. `CatalyzeDB` 우클릭 → 삭제

---

## 도움이 필요하면

- **README.md**: 프로젝트 개요
- **CLAUDE.md**: 개발자 가이드
- **GitHub Issues**: 버그 리포트 및 기능 요청

즐거운 2026년 목표 관리 되세요! 🚀
