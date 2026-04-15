import Link from "next/link"
import { Trophy } from "lucide-react"

export default function LandingPage() {
  const btnBorder = {
    boxShadow: `
      #111 4px 0px 0px 0px, 
      #111 -4px 0px 0px 0px, 
      #111 0px 4px 0px 0px, 
      #111 0px -4px 0px 0px, 
      inset 4px 4px 0px 0px rgba(255,255,255,0.3),
      inset -4px -4px 0px 0px rgba(0,0,0,0.5)
    `,
    imageRendering: "pixelated" as const,
  }

  return (
    <main className="min-h-screen bg-[#111] flex flex-col items-center justify-center font-mono text-white relative overflow-hidden">
      
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: "radial-gradient(#333 2px, transparent 2px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl px-6 text-center">
        
        <div className="flex items-center justify-center bg-[#222] p-6 mb-4" style={btnBorder}>
          <Trophy className="text-[#4ade80]" size={64} />
        </div>
        
        <h1 className="text-6xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-[#4ade80] to-[#16a34a] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          TalentForge
        </h1>
        
        <p className="text-xl font-bold text-zinc-400 max-w-lg mb-8 uppercase tracking-wider leading-relaxed">
          Level up your life.<br/>Track finances, conquer tasks, and unlock real-world skills in a gamified universe.
        </p>
        
        <Link 
          href="/dashboard"
          className="bg-[#4ade80] text-black text-xl font-black uppercase px-10 py-5 hover:bg-[#22c55e] active:scale-95 transition-all outline-none flex items-center justify-center"
          style={btnBorder}
        >
          Enter TalentForge
        </Link>
      </div>

    </main>
  )
}
