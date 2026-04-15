# 🛡️ TALENTFORGE (v1.0)
### Tactical Lifecycle & Skill Mastery Engine

TalentForge is a custom-engineered productivity OS designed for high-discipline individuals. It replaces traditional "to-do lists" with a **Hexagonal Achievement Map** and an **Integrated Financial Ledger**, cross-linked via a local **Wiki/Knowledge Base**.



---

## 🛰️ Core Modules

### 1. Hex-Grid Skill Tree
- **Geometric Pathfinding:** Skills are mapped on an axial coordinate system ($q, r$).
- **Neural Linking:** Define prerequisites and dependencies with 60°/120° circuit-trace lines.
- **Dynamic Snapping:** Drag-and-drop physics with GPU-accelerated snapping to the nearest hex center.
- **The Codex:** A searchable index for fast navigation and auto-panning.

### 2. Tactical Kanban (Tasks)
- **Weight-Based Triage:** Tasks are automatically sorted by priority: `CRITICAL` > `HIGH` > `MEDIUM` > `LOW`.
- **Active Prioritization:** Critical tasks are physically locked to the top of your view to enforce focus.
- **Reference Binding:** Deep-link tasks directly into your Skill nodes or Wiki notes using `@` triggers.

### 3. Financial Ledger (Finance)
- **Zero-Latency Tracking:** Quick-entry for income and expenses with category-based filtering.
- **Balance Projections:** Real-time calculation of total liquidity.

### 4. Neural Wiki (Notes)
- **Markdown Support:** Clean, structured documentation for your study sessions.
- **Cross-Referencing:** Bi-directional linking between notes, tasks, and skills.

---

## 🛠️ Tech Stack
- **Framework:** [Next.js 16.1](https://nextjs.org/) (App Router & Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strictly Typed)
- **Database:** [SQLite](https://sqlite.org/) (Local) / [PostgreSQL](https://www.postgresql.org/) (Production)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Animation/Physics:** [Framer Motion](https://www.framer.com/motion/)
- **UI Architecture:** [Shadcn UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Auth:** [NextAuth.js](https://next-auth.js.org/) (Configured for Prototype Mode)

---

## 🚀 Deployment (Vercel)

This project is optimized for Vercel with a one-click database sync.

1. **Push to GitHub:** Ensure your `.env` variables are secure.
2. **Connect to Vercel:** Import the repository.
3. **Storage:** Add the **Vercel Postgres** instance.
4. **Build Command:**
   ```bash
   npx prisma generate && npx prisma db push --force-reset && npx prisma db seed && next build
