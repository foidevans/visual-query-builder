# Visual Query Builder

A highly interactive visual query builder built with Next.js 15, TypeScript, and Tailwind CSS v4. Build complex database queries through a graphical interface — no raw SQL or MongoDB syntax required.

**Live Demo:** [visual-query-builder-coral.vercel.app]

---

## Features

- **Recursive condition groups** — unlimited nesting depth with AND/OR logic
- **Schema-driven inputs** — field type determines operators and input controls
- **Live query preview** — SQL and MongoDB syntax updated in real time
- **Query execution simulator** — filters mock datasets, shows paginated results
- **Validation engine** — inline errors shown only after user interaction
- **Drag and drop reordering** — reorder rules within any group
- **Collapsible groups** — collapse nested groups to reduce visual noise
- **Query history** — last 20 executed queries saved automatically
- **Saved presets** — save and reload named query configurations
- **Export / Import** — download query as JSON, import from file
- **Dark / Light mode** — persists across sessions
- **Keyboard shortcuts** — Ctrl+Enter to add rule, Ctrl+Backspace to reset
- **Fully responsive** — tabbed mobile layout
- **State persistence** — query tree, presets, and history survive page refresh

---

## Architecture

### Folder Structure
src/
├── app/                        # Next.js App Router
├── components/
│   └── query-builder/
│       ├── QueryGroup.tsx      # Recursive group component
│       ├── QueryRule.tsx       # Single condition row
│       ├── QueryPreview.tsx    # Live SQL/MongoDB preview
│       ├── ResultsPanel.tsx    # Query execution and results
│       ├── QueryToolbar.tsx    # Actions bar
│       ├── QueryBuilderShell.tsx # Hydration-safe shell
│       ├── SortableGroup.tsx   # Client-only dnd-kit wrapper
│       ├── ThemeToggle.tsx     # Dark/light mode toggle
│       └── KeyboardShortcuts.tsx
├── store/
│   └── queryStore.ts           # Zustand store with persist
├── lib/
│   ├── queryGenerator.ts       # Tree → SQL + MongoDB
│   ├── queryExecutor.ts        # In-memory query execution
│   ├── validator.ts            # Validation engine
│   └── operators.ts            # Operator definitions
├── types/
│   └── query.ts                # TypeScript types
├── data/
│   ├── schemas.ts              # Field schemas (Users, Products, Orders)
│   └── mockData.ts             # Mock datasets
└── hooks/
├── useValidation.ts        # Validation with touched state
└── useKeyboardShortcuts.ts # Global keyboard shortcuts

### Recursive Rendering Strategy

The query tree is a recursive data structure: a `QueryGroup` contains `QueryNode[]`, where each node is either a `QueryRule` or another `QueryGroup`.

The `QueryGroup` component renders itself recursively — when it encounters a child of type `group`, it renders another `QueryGroup` with `depth + 1`. Depth drives the border color cycling and nesting labels. There is no maximum depth limit.
QueryGroup (depth 0, AND)
├── QueryRule
├── QueryRule
└── QueryGroup (depth 1, OR)
├── QueryRule
└── QueryGroup (depth 2, AND)
└── QueryRule

### State Management

Zustand is used with two middleware layers:
- `devtools` — Redux DevTools support in development
- `persist` — localStorage persistence for `rootGroup`, `selectedSchema`, `presets`, and `history`

All tree mutations use pure recursive helper functions (`updateNodeInTree`, `removeNodeFromTree`, `addToGroup`, `reorderInGroup`) that return new tree copies without mutation.

### Query Engine Design

The query generator (`queryGenerator.ts`) and executor (`queryExecutor.ts`) both do recursive tree traversal:

- **Generator** — converts each node to its SQL or MongoDB equivalent, joining children with the group's logical operator
- **Executor** — filters each row in the mock dataset by recursively evaluating each node against the row. AND groups use `every()`, OR groups use `some()`

### Validation System

The validator traverses the tree recursively and collects `ValidationError[]` objects. Each error contains the `nodeId` of the offending node and a human-readable message.

Errors are only displayed after the user has interacted with a field (touched state), tracked in `useValidation` via a `Set<string>` of touched node IDs.

### Performance Optimizations

- `QueryGroup` and `QueryRule` are wrapped in `React.memo()` to prevent unnecessary re-renders
- `useMemo` is used in `QueryPreview` to avoid regenerating SQL/MongoDB on every render
- Each `DndContext` is scoped to its own group level via `SortableGroup`, preventing global re-renders on drag
- `SortableGroup` uses a `mounted` guard to avoid SSR/client hydration mismatches from dnd-kit's generated IDs
- `QueryBuilderShell` uses a `mounted` guard to prevent Zustand persist hydration flash

### Trade-offs

- **In-memory execution** — the query executor runs against mock data in the browser. A real implementation would serialize the query tree and send it to a backend.
- **Touched state is local** — the `useValidation` hook's touched state resets on page refresh. This is intentional to avoid showing errors on load.
- **Single DndContext per group** — drag and drop is scoped per group level, meaning you cannot drag a rule from one group into another. Cross-group drag would require a global DndContext and more complex tree surgery.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui | UI components |
| Zustand | State management |
| dnd-kit | Drag and drop |
| Vitest + RTL | Testing |
| Vercel | Deployment |

---

## Getting Started

```bash
pnpm install
pnpm dev
```

## Running Tests

```bash
pnpm test:run
```

## Building

```bash
pnpm run build
```