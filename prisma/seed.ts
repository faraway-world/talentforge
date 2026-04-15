import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DEMO_USER_ID = "demo-user-123"

async function main() {
  console.log("🌱 Seeding TalentForge showcase data...")

  // --- CLEAN SLATE ---
  await prisma.skillLog.deleteMany()
  await prisma.note.deleteMany()
  await prisma.task.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log("  ✓ Cleared existing data")

  // --- DEMO USER ---
  await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      name: "Hikari",
      email: "hikari@talentforge.dev",
    }
  })
  console.log("  ✓ Created user: Hikari")

  // --- SKILLS (5 nodes in hex grid) ---
  const fundamentals = await prisma.skill.create({
    data: {
      id: "skill-fundamentals",
      userId: DEMO_USER_ID,
      name: "Fundamentals",
      description: "Core programming concepts — variables, loops, functions, data structures.",
      icon: "📚",
      coordinatesX: 0,
      coordinatesY: -1,
      level: 3,
      category: "Core",
    }
  })

  const react = await prisma.skill.create({
    data: {
      id: "skill-react",
      userId: DEMO_USER_ID,
      name: "React",
      description: "Component architecture, hooks, state management, and the virtual DOM.",
      icon: "⚛️",
      coordinatesX: 1,
      coordinatesY: -1,
      level: 2,
      category: "Frontend",
      parents: { connect: { id: fundamentals.id } },
    }
  })

  const typescript = await prisma.skill.create({
    data: {
      id: "skill-typescript",
      userId: DEMO_USER_ID,
      name: "TypeScript",
      description: "Static typing, generics, interfaces, and type-safe code.",
      icon: "🔷",
      coordinatesX: -1,
      coordinatesY: 0,
      level: 2,
      category: "Core",
      parents: { connect: { id: fundamentals.id } },
    }
  })

  const nextjs = await prisma.skill.create({
    data: {
      id: "skill-nextjs",
      userId: DEMO_USER_ID,
      name: "Next.js",
      description: "Server components, API routes, ISR, and full-stack React.",
      icon: "▲",
      coordinatesX: 1,
      coordinatesY: 0,
      level: 1,
      category: "Frontend",
      parents: { connect: [{ id: react.id }, { id: typescript.id }] },
    }
  })

  const architect = await prisma.skill.create({
    data: {
      id: "skill-architect",
      userId: DEMO_USER_ID,
      name: "Advanced Architect",
      description: "System design, microservices, CI/CD pipelines, and production infrastructure.",
      icon: "🏗️",
      coordinatesX: 0,
      coordinatesY: 1,
      level: 1,
      category: "Engineering",
      parents: { connect: { id: nextjs.id } },
    }
  })

  // Skill Logs (practice hours)
  await prisma.skillLog.createMany({
    data: [
      { skillId: fundamentals.id, hours: 120, notes: "CS50 + freeCodeCamp grind" },
      { skillId: fundamentals.id, hours: 45, notes: "LeetCode practice sessions" },
      { skillId: react.id, hours: 60, notes: "Built 3 portfolio projects" },
      { skillId: react.id, hours: 25, notes: "React hooks deep-dive" },
      { skillId: typescript.id, hours: 40, notes: "Migrated JS project to TS" },
      { skillId: typescript.id, hours: 15, notes: "Advanced generics study" },
      { skillId: nextjs.id, hours: 30, notes: "Built TalentForge prototype" },
    ]
  })

  console.log("  ✓ Created 5 skills with prerequisite tree + 7 practice logs")

  // --- TASKS (5 across priorities) ---
  const task1 = await prisma.task.create({
    data: {
      id: "task-1",
      userId: DEMO_USER_ID,
      title: "Deploy TalentForge to Vercel",
      description: "Final production push — configure env vars, run seed, verify all modules.",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      skillId: nextjs.id,
    }
  })

  const task2 = await prisma.task.create({
    data: {
      id: "task-2",
      userId: DEMO_USER_ID,
      title: "Master React Server Components",
      description: "Deep-dive into RSC patterns, streaming, and suspense boundaries.",
      status: "TODO",
      priority: "HIGH",
      skillId: react.id,
    }
  })

  const task3 = await prisma.task.create({
    data: {
      id: "task-3",
      userId: DEMO_USER_ID,
      title: "Build Portfolio Landing Page",
      description: "Create a stunning portfolio site using Next.js and Framer Motion.",
      status: "TODO",
      priority: "HIGH",
      skillId: nextjs.id,
    }
  })

  await prisma.task.create({
    data: {
      id: "task-4",
      userId: DEMO_USER_ID,
      title: "Read 'The Book of Five Rings' by Musashi",
      description: "Study Musashi's strategy philosophy — apply to problem-solving.",
      status: "DONE",
      priority: "MEDIUM",
    }
  })

  await prisma.task.create({
    data: {
      id: "task-5",
      userId: DEMO_USER_ID,
      title: "Refactor Finance Module Types",
      description: "Replace runtime type checks with Zod schemas across the finance actions.",
      status: "TODO",
      priority: "LOW",
      skillId: typescript.id,
    }
  })

  console.log("  ✓ Created 5 tasks across CRITICAL → LOW priorities")

  // --- FINANCE (10 transactions) ---
  const today = new Date()
  const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000)

  await prisma.transaction.createMany({
    data: [
      { userId: DEMO_USER_ID, amount: 15000, type: "INCOME", category: "Stipend", notes: "Monthly internship stipend", date: daysAgo(28) },
      { userId: DEMO_USER_ID, amount: 4500, type: "EXPENSE", category: "Rent", notes: "Hostel rent — April", date: daysAgo(25) },
      { userId: DEMO_USER_ID, amount: 250, type: "INCOME", category: "Cashback", notes: "UPI cashback reward", date: daysAgo(20) },
      { userId: DEMO_USER_ID, amount: 800, type: "EXPENSE", category: "Food", notes: "Weekly mess + snacks", date: daysAgo(18) },
      { userId: DEMO_USER_ID, amount: 1200, type: "EXPENSE", category: "Course", notes: "Udemy — Advanced TypeScript", date: daysAgo(15) },
      { userId: DEMO_USER_ID, amount: 500, type: "INCOME", category: "Freelance", notes: "Quick logo design gig", date: daysAgo(12) },
      { userId: DEMO_USER_ID, amount: 350, type: "EXPENSE", category: "Transport", notes: "Metro pass recharge", date: daysAgo(10) },
      { userId: DEMO_USER_ID, amount: 2000, type: "INCOME", category: "Freelance", notes: "Landing page for a startup", date: daysAgo(7) },
      { userId: DEMO_USER_ID, amount: 600, type: "EXPENSE", category: "Food", notes: "Celebrating project ship 🎉", date: daysAgo(3) },
      { userId: DEMO_USER_ID, amount: 150, type: "EXPENSE", category: "Utilities", notes: "Mobile recharge", date: daysAgo(1) },
    ]
  })

  console.log("  ✓ Created 10 finance transactions")

  // --- NOTES (2 wiki entries with @ references) ---
  await prisma.note.create({
    data: {
      id: "note-welcome",
      userId: DEMO_USER_ID,
      title: "Welcome to TalentForge",
      folder: "General",
      content: `# Welcome to TalentForge 🔥

TalentForge is your personal growth operating system — a unified dashboard for tracking skills, tasks, finances, and knowledge.

## Core Modules

### 🎯 Skills
The hex-grid skill map visualizes your learning journey. Each node represents a skill, and connections show prerequisite paths.

### ✅ Tasks
A Kanban-style board for managing your work. Tasks can be linked to skills for cross-module tracking.

Currently working on: [[ Task : Deploy TalentForge to Vercel | task-1 ]]

### 💰 Finance
Track income and expenses with category breakdowns. Perfect for managing a student budget.

### 📝 Notes (Wiki)
This module! A personal wiki with @ references to link your notes to tasks, skills, and transactions.

---

*Built with Next.js, Prisma, and determination.*`
    }
  })

  await prisma.note.create({
    data: {
      id: "note-learning-path",
      userId: DEMO_USER_ID,
      title: "My Learning Roadmap",
      folder: "Career",
      content: `# Learning Roadmap — 2026

## Current Focus
Right now I'm deep in the React + Next.js ecosystem. The goal is to become a full-stack architect by end of year.

## Active Tasks
- [[ Task : Master React Server Components | task-2 ]]
- [[ Task : Build Portfolio Landing Page | task-3 ]]

## Skill Progression
Started from [[ Skill : Fundamentals | skill-fundamentals ]] and branching into framework mastery.

The path: Fundamentals → TypeScript → React → Next.js → Advanced Architect

## Strategy
Inspired by Musashi's philosophy: master the fundamentals so deeply that advanced techniques become natural extensions.

> "Do nothing that is of no use." — Miyamoto Musashi`
    }
  })

  console.log("  ✓ Created 2 wiki notes with @ references")

  console.log("\n✅ Seed complete! TalentForge is ready to dazzle.")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
