"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- DEMO MODE: Hardcoded user for prototype showcase ---
const DEMO_USER_ID = "demo-user-123"

export async function getTasks() {
  const tasks = await prisma.task.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { createdAt: "desc" },
  })

  return tasks
}

export async function addTask(formData: FormData) {
  const title = formData.get("title")?.toString()
  const priority = formData.get("priority")?.toString() || "MEDIUM"
  const dueDateStr = formData.get("dueDate")?.toString()
  const skillId = formData.get("skillId")?.toString()
  const status = formData.get("status")?.toString() || "TODO"
  const description = formData.get("description")?.toString()

  if (!title) return { error: "Title is required" }

  let dueDate: Date | undefined
  if (dueDateStr) {
    dueDate = new Date(dueDateStr)
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        priority,
        status,
        dueDate,
        description,
        userId: DEMO_USER_ID,
        skillId: skillId || null,
      }
    })
    
    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    return { success: true, task }
  } catch (error) {
    console.error("Failed to add task:", error)
    return { error: "Failed to add task" }
  }
}

export async function updateTaskStatus(id: string, status: string) {
  try {
    await prisma.task.update({
      where: { id },
      data: { status }
    })
    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to update task status:", error)
    return { error: "Failed to update task status" }
  }
}

export async function updateTaskDescription(id: string, description: string) {
  try {
    await prisma.task.update({
      where: { id },
      data: { description }
    })
    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to update task description:", error)
    return { error: "Failed to update task description" }
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id }
    })
    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete task:", error)
    return { error: "Failed to delete task" }
  }
}
