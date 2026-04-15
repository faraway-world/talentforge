import { getTransactions, getBalance } from "./actions"
import { TransactionForm } from "@/components/finance/transaction-form"
import { FlashWrapper } from "@/components/ui/flash-wrapper"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = "force-dynamic"

export default async function FinancePage() {
  const transactions = await getTransactions()
  const balance = await getBalance()
  const isPositive = balance >= 0

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

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-10 font-mono">

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center bg-[#222] p-8 border-4 border-[#333] shadow-[8px_8px_0_0_#111]">
        <div>
          <h2 className="text-zinc-500 uppercase tracking-widest font-bold mb-2">Total Balance</h2>
          <div className={`text-5xl font-black tracking-tighter ${isPositive ? 'text-[#4ade80]' : 'text-red-400'}`}>
            {isPositive ? "+" : "-"}${Math.abs(balance).toFixed(2)}
          </div>
        </div>
        <TransactionForm
          triggerText="Add"
          triggerClassName="bg-[#4ade80] text-black font-black uppercase tracking-wider px-6 py-4 hover:brightness-110 active:translate-y-1 transition-transform flex items-center justify-center gap-2 h-14 cursor-pointer"
          triggerStyle={btnBorder}
        />
      </div>

      {/* Transactions Table */}
      <section className="bg-[#1a1a1a] border-4 border-[#333] shadow-[inset_4px_4px_0_0_#222,inset_-4px_-4px_0_0_#111] p-6 overflow-x-auto">
        <h3 className="text-xl font-black uppercase text-white mb-6 tracking-widest border-b-2 border-[#333] pb-4">Recent Transactions</h3>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 font-bold uppercase tracking-widest">
            No transactions yet. Start logging!
          </div>
        ) : (
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#333] hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-bold uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-zinc-400 font-bold uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-zinc-400 font-bold uppercase tracking-wider w-full">Description</TableHead>
                  <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-right">Amount</TableHead>
                  <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-center w-20">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t: any) => (
                  <FlashWrapper key={t.id} isTableRow id={`finance-${t.id}`} className="border-[#333] hover:bg-[#222] transition-colors border-b">
                    <TableCell className="font-bold text-zinc-300">
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <span className="bg-[#2d2d2d] border border-[#555] px-3 py-1 text-xs uppercase tracking-wider text-zinc-300 font-bold inline-block shadow-[2px_2px_0_0_#111]">
                        {t.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-400">{t.notes || "-"}</TableCell>
                    <TableCell className={`text-right font-black tracking-wider text-lg ${t.type === "INCOME" ? "text-[#4ade80]" : "text-white"}`}>
                      {t.type === "INCOME" ? "+" : "-"}${t.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <TransactionForm
                        initialData={t}
                        triggerText="Edit"
                        triggerClassName="text-zinc-500 hover:text-[#4ade80] transition-colors cursor-pointer text-xs uppercase font-bold tracking-wider border border-[#333] px-2 py-1 hover:border-[#4ade80] bg-transparent inline-block"
                      />
                    </TableCell>
                  </FlashWrapper>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
