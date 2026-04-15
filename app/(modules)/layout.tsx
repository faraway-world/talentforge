import { Sidebar } from "@/components/shared/sidebar"
import { TopNav } from "@/components/shared/topnav"

export default function ModulesLayout({ 
  children,
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="flex flex-row h-screen w-full bg-[#1a1a1a] text-zinc-100 overflow-hidden font-mono text-sm antialiased">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopNav />
        <main className="flex-1 overflow-y-auto w-full relative z-0 style-minecraft-scroll">
          {children}
        </main>
      </div>
    </div>
  )
}
