"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// --- DEMO MODE: Hardcoded user for prototype showcase ---
const DEMO_USER_ID = "demo-user-123"

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
})

export async function getTransactions() {
  return prisma.transaction.findMany({
    orderBy: { date: "desc" },
  })
}

export async function getBalance() {
  const transactions = await prisma.transaction.findMany()
  
  return transactions.reduce((acc: number, t: { amount: number, type: string }) => {
    return t.type === "INCOME" ? acc + t.amount : acc - t.amount
  }, 0)
}

export async function addTransaction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = transactionSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await prisma.transaction.create({
      data: {
        userId: DEMO_USER_ID,
        amount: parsed.data.amount,
        type: parsed.data.type,
        category: parsed.data.category,
        notes: parsed.data.notes,
      },
    })

    revalidatePath("/finance")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "Failed to add transaction" }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = transactionSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await prisma.transaction.update({
      where: { id },
      data: {
        amount: parsed.data.amount,
        type: parsed.data.type,
        category: parsed.data.category,
        notes: parsed.data.notes,
      },
    })

    revalidatePath("/finance")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update transaction" }
  }
}
