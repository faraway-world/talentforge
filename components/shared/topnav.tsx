"use client"

import { usePathname } from "next/navigation"

export function TopNav() {
  const pathname = usePathname()
  
  // Format the title based on the route (e.g., "/skills" -> "Skills")
  const pathSegment = pathname.split("/")[1]
  const title = pathSegment 
    ? pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1)
    : "Dashboard"

  const handlePrototypeSignIn = () => {
    alert("🔒 Prototype Mode\n\nAuthentication is disabled for this showcase.\nAll data is pre-seeded for demonstration purposes.\n\nFull OAuth login will be enabled in v1.1")
  }

  return (
    <header className="h-16 shrink-0 bg-[#111] border-b-4 border-[#333] flex items-center justify-between px-6 z-10 w-full relative">
      <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center font-mono">
        <span className="text-[#4ade80] mr-2">/</span>
        {title}
      </h2>
      
      <div className="flex items-center gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Demo User</span>
            <span className="text-[10px] text-zinc-500 tracking-wide">v1.0 Alpha</span>
          </div>
          {/* Blocky user avatar — click shows prototype notice */}
          <div 
            className="w-8 h-8 bg-[#4ade80] flex items-center justify-center text-black font-black shadow-[2px_2px_0_0_#fff] cursor-pointer hover:bg-[#22c55e] transition-colors"
            onClick={handlePrototypeSignIn}
            title="Prototype Mode"
          >
            H
          </div>
        </div>
      </div>
    </header>
  )
}
