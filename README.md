# Requête

> The visual IDE for database engineers. Build complex queries with zero friction.

Requête is a highly interactive visual query builder built with Next.js, TypeScript, and Tailwind CSS v4. Construct complex database queries through a graphical interface — no raw SQL or MongoDB syntax required.

**Live Demo:** [visual-query-builder-coral.vercel.app]

---

## Overview

Requête lets you build queries the way you think about them — as nested logical conditions — and translates them into SQL or MongoDB syntax in real time. Select a schema, add conditions, group them with AND/OR logic, and execute against a live dataset, all without writing a single line of query syntax.

---

## Features

### Core
- **Recursive condition groups** — unlimited nesting depth with AND/OR logic at every level
- **Schema-driven inputs** — field type determines available operators and input controls automatically
- **Live query preview** — SQL and MongoDB syntax update in real time as you build
- **Query execution simulator** — filters mock datasets in memory, shows paginated results with row count and execution time
- **Validation engine** — inline errors appear only after user interaction (touched state), never on load

### Interactions
- **Drag and drop reordering** — reorder rules within any group via dnd-kit
- **Collapsible groups** — collapse nested groups to reduce visual noise
- **Keyboard shortcuts** — Ctrl+Enter, Ctrl+G, Ctrl+R, Ctrl+Del
- **Dark / Light mode** — full theme system persists across sessions
- **Fully responsive** — tabbed Builder / Preview / Results layout on mobile

### Workspace
- **Query history** — last 20 executed queries saved automatically
- **Saved presets** — name, save, and reload query configurations
- **Export / Import** — download query as JSON, import from file
- **State persistence** — query tree, presets, and history survive page refresh via Zustand persist

### UX
- **Splash screen** — branded loading screen on first visit
- **Welcome modal** — feature overview on first load, with "Don't show again" option
- **Settings panel** — workspace stats, keyboard shortcuts reference, and danger zone reset
- **Schema sidebar** — browse all available fields with color-coded type badges

---

## Architecture

### Folder Structure
src/
├── app/                          # Next.js App Router
├── components/
│   ├── query-builder/
│   │   ├── QueryGroup.tsx        # Recursive group component
│   │   ├── QueryRule.tsx         # Single condition row
│   │   ├── QueryPreview.tsx      # Live SQL/MongoDB preview
│   │   ├── ResultsPanel.tsx      # Query execution and results table
│   │   ├── QueryToolbar.tsx      # Actions bar (reset, export, presets, history)
│   │   ├── QueryBuilderShell.tsx # Hydration-safe layout shell
│   │   ├── SortableGroup.tsx     # Client-only dnd-kit wrapper
│   │   ├── SchemaSidebar.tsx     # Field browser with type badges
│   │   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │   └── KeyboardShortcuts.tsx # Shortcuts dropdown
│   ├── Navbar.tsx                # Top navigation bar
│   ├── SplashScreen.tsx          # First-visit branded loading screen
│   ├── WelcomeModal.tsx          # Onboarding feature overview modal
│   └── SettingsModal.tsx         # Settings panel
├── store/
│   └── queryStore.ts             # Zustand store with devtools + persist
├── lib/
│   ├── queryGenerator.ts         # Query tree → SQL + MongoDB
│   ├── queryExecutor.ts          # In-memory query execution engine
│   ├── validator.ts              # Recursive validation engine
│   └── operators.ts              # Operator definitions with type restrictions
├── types/
│   └── query.ts                  # TypeScript types for the query tree
├── data/
│   ├── schemas.ts                # Field schemas — Users, Products, Orders
│   └── mockData.ts               # Mock datasets for query execution
└── hooks/
├── useValidation.ts          # Validation with touched state tracking
└── useKeyboardShortcuts.ts   # Global keyboard shortcut registration

### Recursive Rendering Strategy

The query tree is a recursive data structure. A `QueryGroup` contains `QueryNode[]`, where each node is either a `QueryRule` (a single condition) or another `QueryGroup` (a nested container).

`QueryGroup` renders itself recursively — when it encounters a child of type `group`, it renders another `QueryGroup` with `depth + 1`. Depth drives border color cycling and nesting labels. There is no maximum depth limit.
QueryGroup (depth 0, AND)
├── QueryRule: age > 18
├── QueryRule: country = "Nigeria"
└── QueryGroup (depth 1, OR)
├── QueryRule: status = "active"
└── QueryGroup (depth 2, AND)
└── QueryRule: purchases > 10

### State Management

Zustand is used with two middleware layers:
- `devtools` — Redux DevTools integration in development
- `persist` — localStorage persistence for `rootGroup`, `selectedSchema`, `presets`, and `history`

All tree mutations use pure recursive helper functions that return new tree copies without mutation:

| Function | Purpose |
|---|---|
| `updateNodeInTree` | Update any node by ID at any depth |
| `removeNodeFromTree` | Remove any node by ID recursively |
| `addToGroup` | Add a rule or group to a target group by ID |
| `reorderInGroup` | Reorder children within a specific group |

### Query Engine Design

Both `queryGenerator.ts` and `queryExecutor.ts` use recursive tree traversal:

- **Generator** — converts each node to its SQL or MongoDB equivalent, joining children with the group's logical operator. AND groups produce `a AND b`, OR groups produce `a OR b`, nested groups wrap in parentheses.
- **Executor** — filters each row in the mock dataset by recursively evaluating every node against the row. AND groups use `Array.every()`, OR groups use `Array.some()`.

### Validation System

The validator traverses the tree recursively and collects `ValidationError[]`. Each error contains the `nodeId` of the offending node and a human-readable message.

Errors are only shown after the user has interacted with a field — tracked via a `Set<string>` of touched node IDs in `useValidation`. This prevents red borders appearing on load before the user has done anything.

### Performance Optimizations

| Technique | Where |
|---|---|
| `React.memo()` | `QueryGroup`, `QueryRule` — prevents re-renders on unrelated state changes |
| `useMemo` | `QueryPreview` — SQL/MongoDB only regenerates when `rootGroup` changes |
| Scoped `DndContext` | `SortableGroup` — each group owns its own drag context, preventing global re-renders |
| `mounted` guard | `SortableGroup` — prevents dnd-kit SSR hydration mismatch |
| `mounted` guard | `QueryBuilderShell` — prevents Zustand persist flash on refresh |
| Stable keys | All tree nodes use `crypto.randomUUID()` on creation |

### Design System

Requête uses a CSS variable token system built on a **Minimalist Flat 2.0 + Dark Mode** aesthetic:

- **Background layers** — depth communicated through tonal shifts (`#0f0f0f` → `#1a1a1a` → `#2a2a2a`) rather than shadows
- **Logic colors** — AND groups use electric blue (`#3b82f6`), OR groups use violet (`#8b5cf6`)
- **Type colors** — string (green), number (orange), date (blue), enum (purple), boolean (yellow)
- **Typography** — Inter for UI labels, JetBrains Mono for code preview and data values
- **Borders** — consistent 1px borders, no blur effects

### Trade-offs

- **In-memory execution** — the query executor runs against mock data in the browser. A production implementation would serialize the query tree and send it to a backend API.
- **Touched state is local** — `useValidation` touched state resets on page refresh intentionally, to avoid showing errors on load.
- **Single DndContext per group** — drag and drop is scoped per group level. Cross-group dragging would require a global DndContext and more complex tree surgery involving node reparenting.
- **No real database** — schemas and mock data are static. A real implementation would fetch schema metadata and paginated results from a database connection.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16 | Framework (App Router) |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | v4 | Styling |
| shadcn/ui | Latest | UI component primitives |
| Zustand | 5 | State management |
| dnd-kit | 6 | Drag and drop |
| Vitest | 4 | Unit and integration testing |
| React Testing Library | 16 | Component testing |
| Vercel | — | Deployment and CD |

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests

```bash
# Run all tests once
pnpm test:run

# Watch mode
pnpm test
```

## Building for Production

```bash
pnpm run build
pnpm start
```

---

## Test Coverage

| Suite | Tests | Coverage |
|---|---|---|
| `queryGenerator.test.ts` | 15 | SQL generation, MongoDB generation, nested groups, all operators |
| `queryExecutor.test.ts` | 11 | Filtering, AND/OR logic, nested groups, edge cases |
| `validator.test.ts` | 9 | Empty groups, missing fields, invalid operators, between validation |
| `operators.test.ts` | 10 | Type filtering, operator definitions, valueCount |
| `queryFlow.test.ts` | 8 | Full validate → generate → execute integration flow |
| **Total** | **53** | |

---
