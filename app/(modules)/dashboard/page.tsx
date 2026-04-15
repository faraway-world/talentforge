import { getSkillTree } from "../skills/actions"
import { getTasks } from "../tasks/actions"
import { getTransactions } from "../finance/actions"
import { TransactionForm } from "@/components/finance/transaction-form"
import { FlashWrapper } from "@/components/ui/flash-wrapper"
import Link from "next/link"
import { Wallet, CheckSquare, Trophy, Plus, Pencil } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { nodes } = await getSkillTree()
  const tasks = await getTasks()
  const transactions = await getTransactions()
  
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t: any) => t.status === "DONE").length
  const pendingTasks = totalTasks - completedTasks

  // Find the last unlocked skill
  const unlockedSkills = nodes.filter((n: any) => n.isUnlocked)
  const lastSkill = unlockedSkills.length > 0 ? unlockedSkills[unlockedSkills.length - 1] : null

  // Minecraft border styles
  const minecraftBorder = {
    boxShadow: `
      #111 4px 0px 0px 0px, 
      #111 -4px 0px 0px 0px, 
      #111 0px 4px 0px 0px, 
      #111 0px -4px 0px 0px, 
      #333 8px 0px 0px 0px, 
      #333 -8px 0px 0px 0px, 
      #333 0px 8px 0px 0px, 
      #333 0px -8px 0px 0px, 
      inset 4px 4px 0px 0px rgba(255,255,255,0.1),
      inset -4px -4px 0px 0px rgba(0,0,0,0.5)
    `,
    imageRendering: "pixelated" as const,
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

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-10">
      
      <section>
        <h2 className="text-2xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
          <span className="w-3 h-8 bg-[#4ade80] inline-block shadow-[2px_2px_0_0_#111]" /> 
          Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Finance */}
          <div className="bg-[#222] p-6 relative flex flex-col gap-4" style={minecraftBorder}>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold uppercase text-zinc-400">Monthly Budget</h3>
              <Wallet className="text-[#60a5fa]" size={24} />
            </div>
            <div className="text-3xl font-black">$1,450 <span className="text-sm text-zinc-500">of $2,000</span></div>
            <div className="w-full h-4 bg-[#111] overflow-hidden drop-shadow-md">
              <div className="h-full bg-[#60a5fa] w-[72%] border-r-2 border-white/20" />
            </div>
          </div>

          {/* Card 2: Tasks */}
          <div className="bg-[#222] p-6 relative flex flex-col gap-4" style={minecraftBorder}>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold uppercase text-zinc-400">Tasks</h3>
              <CheckSquare className="text-[#f472b6]" size={24} />
            </div>
            <div className="flex items-center gap-6">
              {/* Circular progress visualization */}
              <div className="relative w-16 h-16 rounded-full bg-[#111] flex items-center justify-center border-4 border-[#333]">
                <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[0.85]">
                  <circle cx="50%" cy="50%" r="28" fill="none" stroke="#f472b6" strokeWidth="8" className="opacity-70 transition-all duration-500" strokeDasharray={`${totalTasks > 0 ? (completedTasks / totalTasks) * 176 : 0} 176`} />
                </svg>
                <span className="font-black text-sm relative z-10">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">Mastered</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{pendingTasks} Pending</span>
              </div>
            </div>
          </div>

          {/* Card 3: Skills */}
          <div className="bg-[#222] p-6 relative flex flex-col gap-4" style={minecraftBorder}>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold uppercase text-zinc-400">Latest Skill</h3>
              <Trophy className="text-[#4ade80]" size={24} />
            </div>
            <div className="text-2xl font-black text-[#4ade80]">
              {lastSkill ? String(lastSkill.name) : "None Unlocked"}
            </div>
            <div className="text-sm font-bold text-zinc-500 uppercase">
              {lastSkill ? `${String(lastSkill.totalHours)} Hours Logged` : "Start logging practice!"}
            </div>
          </div>

        </div>
      </section>

      <section>
        <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-3">
          <span className="w-3 h-8 bg-[#60a5fa] inline-block shadow-[2px_2px_0_0_#111]" /> 
          Recent Activity
        </h2>
        <div className="flex flex-col gap-4">
          {transactions.slice(0, 3).map((t: any) => (
             <FlashWrapper key={t.id} id={`finance-${t.id}`} className="bg-[#1a1a1a] p-4 border-2 border-[#333] shadow-[4px_4px_0_0_#111] flex justify-between items-center hover:border-[#555] transition-colors">
                <div>
                   <span className="bg-[#2d2d2d] border border-[#555] px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-300 font-bold inline-block mr-3">
                     {t.category}
                   </span>
                   <span className="text-zinc-300 font-bold">{t.notes || "Unnamed transaction"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-black tracking-wider text-lg lg:text-xl ${t.type === "INCOME" ? "text-[#4ade80]" : "text-white"}`}>
                    {t.type === "INCOME" ? "+" : "-"}${t.amount.toFixed(2)}
                  </span>
                </div>
             </FlashWrapper>
          ))}
          {transactions.length === 0 && (
            <div className="text-zinc-600 font-bold uppercase text-sm">No recent finance activity</div>
          )}
        </div>
      </section>

      <section className="bg-[#1a1a1a] p-6 border-4 border-[#333] shadow-[inset_4px_4px_0_0_#222,inset_-4px_-4px_0_0_#111]">
        <h3 className="text-xl font-black uppercase text-white mb-6 tracking-widest">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/skills" className="bg-[#4ade80] text-black font-black uppercase tracking-wider px-6 py-3 hover:brightness-110 active:translate-y-1 transition-transform flex items-center gap-2" style={btnBorder}>
            <Plus size={18} /> Log Session
          </Link>
          <TransactionForm
            triggerText="Add Expense"
            triggerClassName="bg-[#60a5fa] text-black font-black uppercase tracking-wider px-6 py-3 hover:brightness-110 active:translate-y-1 transition-transform flex items-center gap-2 cursor-pointer"
            triggerStyle={btnBorder}
          />
          <Link href="/tasks" className="bg-[#f472b6] text-black font-black uppercase tracking-wider px-6 py-3 hover:brightness-110 active:translate-y-1 transition-transform flex items-center gap-2" style={btnBorder}>
            <Plus size={18} /> New Task
          </Link>
        </div>
      </section>

    </div>
  )
}
