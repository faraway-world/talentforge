"use client"

import React, { useState } from "react"
import { addTransaction, updateTransaction } from "@/app/(modules)/finance/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const categories = ["Salary", "Freelance", "Cashback", "Housing", "Food", "Utilities", "Transport", "Fun", "Other"]

interface TransactionFormProps {
  triggerText?: string
  triggerClassName?: string
  triggerStyle?: React.CSSProperties
  initialData?: any
}

export function TransactionForm({ triggerText = "Add Transaction", triggerClassName, triggerStyle, initialData }: TransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const result = initialData ? await updateTransaction(initialData.id, formData) : await addTransaction(formData)
    
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  const btnBorder = {
    boxShadow: `
      #111 2px 0px 0px 0px, 
      #111 -2px 0px 0px 0px, 
      #111 0px 2px 0px 0px, 
      #111 0px -2px 0px 0px, 
      inset 2px 2px 0px 0px rgba(255,255,255,0.2),
      inset -2px -2px 0px 0px rgba(0,0,0,0.5)
    `,
  }

  const defaultTriggerClass = "bg-[#4ade80] text-black font-black uppercase tracking-wider px-6 py-3 hover:brightness-110 active:translate-y-1 transition-transform flex items-center gap-2 cursor-pointer"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={triggerClassName || defaultTriggerClass}
        style={triggerStyle || btnBorder}
      >
        {!initialData && <Plus size={18} />}
        {triggerText}
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-4 border-[#333] text-white font-mono shadow-[8px_8px_0_0_#111] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-widest text-white">{initialData ? "Edit" : "New"} Transaction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          
          <div className="space-y-4">
            <RadioGroup defaultValue={initialData ? initialData.type : "EXPENSE"} name="type" className="flex gap-4">
              <div className="flex items-center space-x-2 bg-[#2d2d2d] px-4 py-2 border-2 border-[#555] flex-1 cursor-pointer">
                <RadioGroupItem value="EXPENSE" id="r1" className="border-white text-white" />
                <Label htmlFor="r1" className="cursor-pointer font-bold text-red-400 uppercase tracking-widest">Expense</Label>
              </div>
              <div className="flex items-center space-x-2 bg-[#2d2d2d] px-4 py-2 border-2 border-[#555] flex-1 cursor-pointer">
                <RadioGroupItem value="INCOME" id="r2" className="border-white text-[#4ade80]" />
                <Label htmlFor="r2" className="cursor-pointer font-bold text-[#4ade80] uppercase tracking-widest">Income</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="amount" className="font-bold uppercase text-zinc-400">Amount ($)</Label>
            <Input id="amount" defaultValue={initialData ? initialData.amount : undefined} name="amount" type="number" step="0.01" required className="bg-[#111] border-2 border-[#555] rounded-none focus-visible:ring-0 focus-visible:border-[#4ade80] text-lg font-bold h-12" placeholder="0.00" />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="category" className="font-bold uppercase text-zinc-400">Category</Label>
            <select id="category" name="category" required defaultValue={initialData ? initialData.category : ""} className="bg-[#111] border-2 border-[#555] rounded-none focus-visible:ring-0 focus-visible:border-[#4ade80] text-white p-3 font-mono cursor-pointer outline-none">
              <option value="" disabled>Select category...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="notes" className="font-bold uppercase text-zinc-400">Notes (Optional)</Label>
            <Input id="notes" name="notes" defaultValue={initialData ? initialData.notes : undefined} className="bg-[#111] border-2 border-[#555] rounded-none focus-visible:ring-0 focus-visible:border-[#4ade80] h-12" placeholder="E.g. Groceries..." />
          </div>

          {error && <div className="text-red-400 font-bold bg-red-950/50 p-3 border-l-4 border-red-500">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full bg-[#4ade80] text-black font-black uppercase tracking-wider h-14 hover:bg-[#22c55e] transition-transform active:translate-y-1 rounded-none mt-4 text-lg" style={btnBorder}>
            {loading ? "Saving..." : "Save Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
