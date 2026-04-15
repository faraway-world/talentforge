"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, CheckSquare, Trophy, StickyNote } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Skills", href: "/skills", icon: Trophy },
  { name: "Notes", href: "/notes", icon: StickyNote },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex flex-col h-full bg-[#111] border-r-4 border-[#333] shrink-0 font-mono">
      <div className="p-4 border-b-4 border-[#333] mb-4">
        <h1 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
          <Trophy className="text-[#4ade80]" size={24} />
          TalentForge
        </h1>
      </div>
      
      <nav className="flex flex-col gap-2 px-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider font-bold transition-all
                ${isActive 
                  ? "bg-[#2d2d2d] text-white border-l-4 border-[#4ade80] shadow-[inset_4px_4px_0_0_rgba(255,255,255,0.05),inset_-4px_-4px_0_0_rgba(0,0,0,0.4)]" 
                  : "text-zinc-500 hover:bg-[#1e1e1e] hover:text-white border-l-4 border-transparent"
                }
              `}
            >
              <item.icon size={18} className={isActive ? "text-[#4ade80]" : ""} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t-4 border-[#333] text-xs text-zinc-600 font-bold uppercase tracking-widest text-center">
        v0.1.0 Alpha
      </div>
    </aside>
  )
}
