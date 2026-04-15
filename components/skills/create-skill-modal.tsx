"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createSkill } from "@/app/(modules)/skills/actions"
import { ReferenceMenu } from "@/components/notes/reference-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Swords, Pickaxe, Hammer, Axe, Shovel, Book, Diamond, Shield, Heart, Plus } from "lucide-react"

const ICONS = [
  { id: "sword", icon: Swords, label: "Sword" },
  { id: "pickaxe", icon: Pickaxe, label: "Pickaxe" },
  { id: "hammer", icon: Hammer, label: "Hammer" },
  { id: "axe", icon: Axe, label: "Axe" },
  { id: "shovel", icon: Shovel, label: "Shovel" },
  { id: "book", icon: Book, label: "Book" },
  { id: "diamond", icon: Diamond, label: "Diamond" },
  { id: "shield", icon: Shield, label: "Shield" },
  { id: "heart", icon: Heart, label: "Heart" },
]

export function CreateSkillModal({ isOpen, onClose, q, r }: { isOpen: boolean, onClose: () => void, q: number, r: number }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("sparkles")
  const [isActivating, setIsActivating] = useState(false)
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [triggerIndex, setTriggerIndex] = useState(-1)

  const getCaretPos = (el: HTMLTextAreaElement) => {
    const div = document.createElement("div")
    const style = window.getComputedStyle(el)
    const props = ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight", "paddingTop", "paddingLeft", "paddingRight", "paddingBottom", "border", "boxSizing", "whiteSpace", "wordWrap"]
    props.forEach(p => div.style[p as any] = style[p as any])
    div.style.position = "absolute"
    div.style.visibility = "hidden"
    div.style.width = style.width
    
    div.textContent = el.value.substring(0, el.selectionEnd)
    const span = document.createElement("span")
    span.textContent = "."
    div.appendChild(span)
    
    document.body.appendChild(div)
    const top = span.offsetTop - el.scrollTop + 20
    const left = span.offsetLeft - el.scrollLeft
    document.body.removeChild(div)
    return { top, left }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (menuOpen && triggerIndex !== -1 && val[triggerIndex] !== '@') {
      setMenuOpen(false)
    }

    if (e.target.selectionEnd && val[e.target.selectionEnd - 1] === '@') {
      const coords = getCaretPos(e.target)
      setMenuPos(coords)
      setMenuOpen(true)
      setTriggerIndex(e.target.selectionEnd - 1)
    }

    setDescription(val)
  }

  const handleRefSelect = (type: string, id: string, label: string) => {
    const textBefore = description.substring(0, triggerIndex)
    const textAfter = description.substring(triggerIndex + 1)
    const displayType = type.charAt(0).toUpperCase() + type.slice(1)
    setDescription(textBefore + `[[ ${displayType} : ${label} | ${id} ]]` + textAfter)
    setMenuOpen(false)
    setTriggerIndex(-1)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  async function handleCreate() {
    if (!name.trim()) return
    setIsActivating(true)
    const result = await createSkill(name, selectedIcon, q, r)
    setIsActivating(false)
    if (result.success) {
      onClose()
      setName("")
      setSelectedIcon("sparkles")
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-[#333] shadow-[8px_8px_0_0_#111] font-mono rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[#4ade80] uppercase tracking-widest font-black">Spawn New Skill</DialogTitle>
          <DialogDescription className="text-zinc-500 font-bold uppercase text-xs">
            Coordinates: [{q}, {r}]
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-white uppercase font-bold text-xs tracking-wider">Skill Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next.js Routing"
              className="bg-black border-2 border-[#333] text-[#4ade80] font-bold focus-visible:ring-0 focus-visible:border-[#4ade80] focus-visible:ring-offset-0 rounded-none shadow-[inset_2px_2px_0_0_#0a0a0a]"
            />
          </div>
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="description" className="text-zinc-400 uppercase font-bold text-xs tracking-wider">Description & References</Label>
            {menuOpen && (
              <ReferenceMenu 
                isOpen={menuOpen} 
                onSelect={handleRefSelect} 
                onClose={() => setMenuOpen(false)} 
                position={menuPos} 
              />
            )}
            <textarea
              ref={textareaRef}
              id="description"
              value={description}
              onChange={handleTextareaChange}
              placeholder="Type @ to reference a Task or Note..."
              className="bg-black border-2 border-[#333] text-zinc-300 font-mono text-sm p-3 h-24 focus-visible:outline-none focus-visible:border-[#4ade80] rounded-none shadow-[inset_2px_2px_0_0_#0a0a0a] resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-white uppercase font-bold text-xs tracking-wider">Skill Icon</Label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {ICONS.map((iconData) => {
                const IconComp = iconData.icon
                const isSelected = selectedIcon === iconData.id
                return (
                  <button
                    key={iconData.id}
                    onClick={() => setSelectedIcon(iconData.id)}
                    className={`flex p-3 items-center justify-center border-2 transition-all shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none ${
                      isSelected 
                        ? 'border-[#4ade80] bg-[#4ade80]/20 text-[#4ade80]' 
                        : 'border-[#333] hover:border-[#4ade80]/50 bg-[#111] text-zinc-500'
                    }`}
                    title={iconData.label}
                  >
                    <IconComp size={20} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleCreate} 
            disabled={!name.trim() || isActivating}
            className="bg-[#4ade80] hover:brightness-110 text-black font-black uppercase tracking-wider w-full rounded-none border-2 border-black shadow-[4px_4px_0_0_#111] active:translate-y-1 active:shadow-none transition-all"
          >
            {isActivating ? "Spawning..." : "Acknowledge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
