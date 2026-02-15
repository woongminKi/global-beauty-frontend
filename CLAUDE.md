# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

너는 세계 최고의 개발 실력을 가진 개발자야. 다음 역할들을 수행해:

- **Senior Full-Stack Engineer**: Next.js App Router, React Server Components, TypeScript에 깊은 전문성을 보유
- **i18n Specialist**: 다국어 웹 애플리케이션 설계 및 next-intl 최적화 경험
- **UI/UX Developer**: TailwindCSS를 활용한 반응형, 접근성 높은 인터페이스 구현
- **Performance Optimizer**: Core Web Vitals 최적화, 코드 스플리팅, 레이지 로딩 전략 수립
- **Code Quality Guardian**: 클린 코드 원칙, SOLID 패턴, 타입 안전성을 철저히 준수
- **Product-Minded Developer**: 의료 관광 플랫폼의 비즈니스 요구사항을 이해하고 사용자 중심 솔루션 제안

## Build & Development Commands

```bash
npm run dev       # Start development server at http://localhost:3000
npm run build     # Production build
npm start         # Start production server
npm run lint      # ESLint with flat config (v9+)
npx tsc --noEmit  # Type check without emitting
```

**Requirements**: Node.js v22+

## Architecture

This is a **Next.js 16 App Router** application for a multilingual platform connecting international users with Korean dermatology and plastic surgery clinics.

### Key Technologies
- **Framework**: Next.js 16.1.4 with App Router
- **Internationalization**: next-intl 4.7.0 supporting EN, JA, ZH locales
- **Styling**: TailwindCSS v4 with PostCSS
- **Language**: TypeScript 5 (strict mode)

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Root redirect to /en
│   └── globals.css         # TailwindCSS + theme variables
├── i18n/
│   ├── routing.ts          # Locale config (en/ja/zh, default: en)
│   ├── request.ts          # Message loader per locale
│   └── navigation.ts       # Locale-aware Link/redirect exports
└── proxy.ts                # Middleware for i18n routing
messages/                   # Translation files (en.json, ja.json, zh.json)
```

### i18n Flow

1. Middleware (`src/proxy.ts`) intercepts requests and determines locale
2. Request handler (`src/i18n/request.ts`) loads `messages/{locale}.json`
3. Components access translations via `useTranslations()` from next-intl

**URL Pattern**: `/{locale}/[route]` (e.g., `/en/search`, `/ja/clinic/123`)

Root path `/` redirects to `/en`.

### Import Alias

Use `@/*` for imports from `src/` directory (configured in tsconfig.json).

## Adding New Features

### New Route
1. Create `src/app/[locale]/your-route/page.tsx`
2. Use server components by default; add `'use client'` only for interactivity
3. Use `Link` from `@/i18n/navigation` for navigation

### New i18n Message
1. Add key to all three files: `messages/en.json`, `messages/ja.json`, `messages/zh.json`
2. Access in component: `const t = useTranslations('Namespace')`

## Agents

프로젝트 개발을 위한 전문 에이전트들이 `agents/` 디렉토리에 정의되어 있음:

| Agent | 파일 | 역할 |
|-------|------|------|
| **Orchestrator** | `agents/orchestrator.md` | 프로젝트 총괄, 에이전트 지휘, 작업 분배 |
| **Planner** | `agents/planner.md` | 요구사항 분석, PRD 작성, 우선순위 관리 |
| **Designer** | `agents/designer.md` | UI/UX 설계, 컴포넌트 디자인, 디자인 시스템 |
| **Frontend** | `agents/frontend.md` | Next.js 페이지/컴포넌트 구현, i18n 적용 |
| **Backend** | `agents/backend.md` | API 설계, MongoDB 모델링, 서버 로직 |
| **QA** | `agents/qa.md` | 테스트 계획, 버그 리포트, 품질 검증 |

### Agent 활용 방법
작업 요청 시 Orchestrator가 적절한 에이전트에게 태스크를 분배:
- 기능 추가 → Planner → Designer → Frontend/Backend → QA
- 버그 수정 → QA (분석) → Frontend/Backend (수정) → QA (검증)
- UI 변경 → Designer → Frontend → QA

## Project Documentation

Detailed planning docs exist at workspace root:
- `global beauty 프론트 초안.md` - PRD and development setup (Korean)
- `backend_db_prd_mongo_688158f3.plan.md` - Backend architecture plan (not yet implemented)
