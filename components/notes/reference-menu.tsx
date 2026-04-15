"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { getAllReferences } from "@/app/(modules)/notes/actions"

interface ReferenceMenuProps {
  isOpen: boolean
  onSelect: (type: string, id: string, label: string) => void
  onClose: () => void
  position: { top: number, left: number }
}

export function ReferenceMenu({ isOpen, onSelect, onClose, position }: ReferenceMenuProps) {
  const [level, setLevel] = useState(1)
  const [category, setCategory] = useState<string | null>(null)
  const [items, setItems] = useState<{ id: string, title: string, detail: string }[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setLevel(1)
      setCategory(null)
      setItems([])
      setQuery("")
    }
  }, [isOpen])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Reset pulse animation
  const [isPulsing, setIsPulsing] = useState(false)
  
  const handleCategorySelect = async (cat: string) => {
    setCategory(cat)
    setLevel(2)
    setLoading(true)
    setIsPulsing(true)
    
    setTimeout(() => setIsPulsing(false), 300) // Reset pulse
    
    // Convert friendly names to DB type logic
    const fetchType = cat === 'Skills' ? 'skill' : cat === 'Tasks' ? 'task' : 'finance'
    
    const data = await getAllReferences(fetchType)
    setItems(data)
    setLoading(false)
  }

  if (!isOpen) return null

  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(query.toLowerCase()) || 
    item.detail?.toLowerCase().includes(query.toLowerCase())
  )

  const minecraftBorder = {
    boxShadow: `
      #111 2px 0px 0px 0px, 
      #111 -2px 0px 0px 0px, 
      #111 0px 2px 0px 0px, 
      #111 0px -2px 0px 0px, 
      #333 4px 0px 0px 0px, 
      #333 -4px 0px 0px 0px, 
      #333 0px 4px 0px 0px, 
      #333 0px -4px 0px 0px, 
      inset 2px 2px 0px 0px rgba(255,255,255,0.1),
      inset -2px -2px 0px 0px rgba(0,0,0,0.5)
    `,
    imageRendering: "pixelated" as const,
  }

  // We add +24px top to render just below the cursor text usually safely
  return (
    <div 
      ref={menuRef}
      className={`absolute z-50 bg-[#1a1a1a] p-2 flex flex-col font-mono text-[#4ade80] transition-colors duration-200 ${isPulsing ? 'bg-[#2a2a2a] shadow-[0_0_15px_#4ade80]' : ''}`}
      style={{
        top: position.top + 24,
        left: position.left,
        width: 300,
        ...minecraftBorder
      }}
    >
      {level === 1 ? (
        <div className="flex flex-col gap-1 w-full">
          <div className="text-[10px] uppercase font-black tracking-widest text-[#f472b6] mb-2 px-2 border-b-2 border-[#333] pb-1">Select Module</div>
          {["Skills", "Tasks", "Finance"].map(opt => (
            <button 
              key={opt}
              onClick={() => handleCategorySelect(opt)}
              className="text-left px-3 py-2 hover:bg-[#333] hover:text-white font-bold tracking-wider transition-colors border-2 border-transparent hover:border-[#4ade80]"
            >
              &gt; {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full max-h-[300px]">
          <div className="flex items-center gap-2 px-2 border-b-2 border-[#333] pb-2">
            <Search size={14} className="text-zinc-500" />
            <input 
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[#4ade80] w-full text-sm font-bold placeholder:text-zinc-600"
              placeholder={`Search ${category}...`}
            />
          </div>
          
          <div className="overflow-y-auto flex flex-col gap-1 flex-1 pr-1 custom-scroll">
            {loading ? (
               <div className="p-4 flex justify-center items-center"><Loader2 className="animate-spin text-zinc-500" /></div>
            ) : filteredItems.length === 0 ? (
               <div className="p-4 text-xs font-bold text-center text-zinc-500">No results found</div>
            ) : (
              filteredItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => {
                    const mappedType = category === 'Skills' ? 'skill' : category === 'Tasks' ? 'task' : 'finance'
                    onSelect(mappedType, item.id, item.title)
                  }}
                  className="text-left px-2 py-2 hover:bg-[#333] transition-colors border-l-2 border-transparent hover:border-[#4ade80] flex flex-col group"
                >
                  <span className="font-bold text-white group-hover:text-[#4ade80] truncate text-sm">{item.title}</span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">{item.detail}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
