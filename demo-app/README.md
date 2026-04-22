# demo-app

Minimal Next.js + Tailwind app that renders a single `<Button />` component. Serves as the visual fixture for the `jira-codex-poc` auto-fix workflow: QA files bug tickets against this component, CI picks them up, Claude Code proposes fixes.

## Figma source of truth

Design: https://www.figma.com/design/01vkPZFlVDN6VVi5Y34AyK/Buton-AI-Fix-POC?node-id=1-3

Published preview: https://zaffre-panic-32176170.figma.site/

The Figma file is the canonical spec. Every `JCP` ticket against the button should link to it.

## Run locally

```bash
cd demo-app
npm install
npm run dev
```

Open http://localhost:3000.

## Seeded defects

`components/Button.tsx` ships with three intentional defects. Each is fixable independently and makes a good single-ticket target.

| # | Category | Figma spec                   | Shipped in code     |
|---|----------|------------------------------|---------------------|
| 1 | Color    | `#2563eb` (`bg-brand`)       | `bg-slate-500`      |
| 2 | Spacing  | 12px vertical, 24px horizontal (`px-6 py-3`) | `px-2 py-1` |
| 3 | A11y     | `<button type="button">`     | `<div onClick={…}>` |

Design tokens for the correct values live in [tailwind.config.ts](tailwind.config.ts):

```ts
colors: { brand: { DEFAULT: "#2563eb", hover: "#1d4ed8", focus: "#93c5fd" } }
```

When a ticket is filed against one of these, the fix should use the named token or exact Figma value — not a different random shade that "looks close."
