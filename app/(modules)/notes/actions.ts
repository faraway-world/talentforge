"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- DEMO MODE: Hardcoded user for prototype showcase ---
const DEMO_USER_ID = "demo-user-123"

export async function getNotes() {
  return prisma.note.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getNote(id: string) {
  return prisma.note.findUnique({
    where: { id }
  })
}

export async function saveNote(id: string | null, title: string, content: string, folder: string = "General") {
  let note
  if (id) {
    note = await prisma.note.update({
      where: { id },
      data: { title, content, folder }
    })
  } else {
    note = await prisma.note.create({
      data: { title, content, folder, userId: DEMO_USER_ID }
    })
  }
  
  revalidatePath("/notes")
  return { success: true, note }
}

export async function deleteNote(id: string) {
  await prisma.note.delete({
    where: { id }
  })
  revalidatePath("/notes")
  return { success: true }
}

export async function getReferencePreview(type: string, id: string) {
  try {
    if (type === "task") {
      const task = await prisma.task.findUnique({ where: { id } })
      if (!task) return null
      return { title: task.title, detail: task.status, link: `/tasks` }
    }
    if (type === "skill") {
      const skill = await prisma.skill.findUnique({ where: { id }, include: { logs: true } })
      if (!skill) return null
      let totalHours = 0
      if (skill.logs) {
        totalHours = skill.logs.reduce((sum, log) => sum + log.hours, 0)
      }
      return { title: skill.name, detail: `${totalHours} Hours`, link: `/skills` }
    }
    if (type === "finance" || type === "transaction") {
      const tx = await prisma.transaction.findUnique({ where: { id } })
      if (!tx) return null
      return { title: tx.category, detail: `${tx.type === 'INCOME' ? '+' : '-'}$${tx.amount}`, link: `/finance` }
    }
    return null
  } catch (error) {
    console.error("Reference preview error:", error)
    return null
  }
}

export async function getAllReferences(type: string) {
  try {
    if (type === "task") {
      const tasks = await prisma.task.findMany({ where: { userId: DEMO_USER_ID } })
      return tasks.map(t => ({ id: t.id, title: t.title, detail: t.status }))
    }
    if (type === "skill") {
      const skills = await prisma.skill.findMany({ where: { userId: DEMO_USER_ID }, include: { logs: true } })
      return skills.map(s => {
        const totalHours = s.logs.reduce((sum, log) => sum + log.hours, 0)
        return { id: s.id, title: s.name, detail: `${totalHours} Hours` }
      })
    }
    if (type === "finance" || type === "transaction") {
      const txs = await prisma.transaction.findMany({ where: { userId: DEMO_USER_ID } })
      return txs.map(t => ({ id: t.id, title: t.category, detail: `${t.type === 'INCOME' ? '+' : '-'}$${t.amount}` }))
    }
    return []
  } catch(error) {
    console.error(error)
    return []
  }
}
