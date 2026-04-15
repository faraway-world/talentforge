import { getTasks } from "./actions"
import { TaskBoard } from "@/components/tasks/task-board"
import { TaskForm } from "@/components/tasks/task-form"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TasksPage() {
  const tasks = await getTasks()

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
          <h2 className="text-zinc-500 uppercase tracking-widest font-bold mb-2">Task Management</h2>
          <div className="text-5xl font-black tracking-tighter text-white">
            Action Items
          </div>
        </div>
        <TaskForm>
          <button className="bg-[#f472b6] text-black font-black uppercase tracking-wider px-6 py-4 hover:brightness-110 active:translate-y-1 transition-transform flex items-center justify-center gap-2 h-14 cursor-pointer" style={btnBorder}>
            <Plus size={20} /> New Task
          </button>
        </TaskForm>
      </div>

      {/* Board */}
      <TaskBoard tasks={tasks} />
      
    </div>
  )
}
