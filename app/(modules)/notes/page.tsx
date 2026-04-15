import { getNotes } from "./actions"
import { WikiClient } from "@/components/notes/wiki-client"

export const dynamic = "force-dynamic"

export default async function NotesPage() {
  const notes = await getNotes()
  
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <h2 className="text-2xl font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-white">
        <span className="w-3 h-8 bg-[#4ade80] inline-block shadow-[2px_2px_0_0_#111]" /> 
        Personal Wiki
      </h2>
      <WikiClient initialNotes={notes} />
    </div>
  )
}
