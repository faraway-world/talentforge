"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { editSkill, addPrerequisite, deletePrerequisite } from "@/app/(modules)/skills/actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Swords, Pickaxe, Hammer, Axe, Shovel, Book, Diamond, Shield, Heart } from "lucide-react"

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

export function EditSkillModal({ isOpen, onClose, skillId, nodes }: { isOpen: boolean, onClose: () => void, skillId: string, nodes: any[] }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("sparkles")
  const [level, setLevel] = useState(1)
  const [category, setCategory] = useState("General")
  const [addHours, setAddHours] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  
  const [selectedParentId, setSelectedParentId] = useState("")

  const node = nodes.find(n => n.id === skillId)

  useEffect(() => {
    if (node) {
      setName(node.name || "")
      setSelectedIcon(node.icon || "sparkles")
      setLevel(node.level || 1)
      setCategory(node.category || "General")
      setAddHours(0) // reset
    }
  }, [node])

  if (!isOpen || !node) return null

  async function handleSave() {
    if (!skillId || !name.trim()) return
    setIsSaving(true)
    const result = await editSkill(skillId, name, selectedIcon, level, category, addHours)
    if (selectedParentId) {
      await addPrerequisite(selectedParentId, skillId)
    }
    setIsSaving(false)
    if (result.success) {
      onClose()
      router.refresh()
    }
  }

  async function handleRemoveParent(parentId: string) {
    const res = await deletePrerequisite(parentId, skillId)
    if (res.success) router.refresh()
  }

  const unlinkedNodes = nodes.filter(n => n.id !== skillId && !node.parents.includes(n.id))

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] text-white border-[#333] shadow-[8px_8px_0_0_#111] font-mono rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[#3b82f6] uppercase tracking-widest font-black">Edit Node Database</DialogTitle>
          <DialogDescription className="text-zinc-500 font-bold uppercase text-xs">
            Identify: {node.id.substring(0, 8)} | Total Hours: {node.totalHours}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 col-span-2">
              <Label className="text-white uppercase font-bold text-xs tracking-wider">Skill Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-2 border-[#333] text-white font-bold focus-visible:ring-0 focus-visible:border-[#3b82f6] rounded-none shadow-[inset_2px_2px_0_0_#000]"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-white uppercase font-bold text-xs tracking-wider">Level (1-5)</Label>
              <Input
                type="number" min={1} max={5}
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
                className="bg-black border-2 border-[#333] text-white font-bold focus-visible:ring-0 focus-visible:border-[#3b82f6] rounded-none shadow-[inset_2px_2px_0_0_#000]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-white uppercase font-bold text-xs tracking-wider">Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-black border-2 border-[#333] text-white font-bold focus-visible:ring-0 focus-visible:border-[#3b82f6] rounded-none shadow-[inset_2px_2px_0_0_#000]"
              />
            </div>
            
            <div className="flex flex-col gap-2 col-span-2 mt-2">
              <Label className="text-[#10b981] uppercase font-black text-xs tracking-wider flex justify-between">
                <span>Add Logged Hours</span>
                <span>+{addHours}</span>
              </Label>
              <input
                type="range" min="0" max="100" step="1"
                value={addHours}
                onChange={(e) => setAddHours(Number(e.target.value))}
                className="w-full accent-[#10b981] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-white uppercase font-bold text-xs tracking-wider">Node Signature</Label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {ICONS.map((iconData) => {
                const IconComp = iconData.icon
                const isSelected = selectedIcon === iconData.id
                return (
                  <button
                    key={iconData.id}
                    onClick={() => setSelectedIcon(iconData.id)}
                    className={`flex p-2 items-center justify-center border-2 transition-all shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none ${
                      isSelected 
                        ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]' 
                        : 'border-[#333] hover:border-[#3b82f6]/50 bg-[#111] text-zinc-500'
                    }`}
                    title={iconData.label}
                  >
                    <IconComp size={18} />
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="border border-[#333] bg-[#0a0a0a] p-3 text-sm">
            <h4 className="uppercase text-xs font-black text-[#f472b6] mb-2 tracking-widest">Tasks & References</h4>
            {node.tasks && node.tasks.length > 0 ? (
              <ul className="space-y-1">
                {node.tasks.map((t: any) => (
                  <li key={t.id} className="text-zinc-400">
                    <a href={`/tasks#task-${t.id}`} className="hover:text-[#f472b6] hover:underline underline-offset-2 flex gap-2">
                      <span className="text-[#333]">[{t.status === 'DONE' ? 'x' : ' '}]</span> {t.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-600 italic text-xs">No tasks currently linked to this node.</p>
            )}
            <p className="text-zinc-600 mt-2 italic text-[10px] uppercase">Notes references handled via global wiki deep links.</p>
          </div>
        </div>
          
          <div className="flex flex-col gap-2">
            <Label className="text-white uppercase font-bold text-xs tracking-wider">Connections (Prerequisites)</Label>
            {node.parents && node.parents.length > 0 && (
              <div className="flex flex-col gap-1 mb-2">
                {node.parents.map((pId: string) => {
                  const pNode = nodes.find(n => n.id === pId);
                  return (
                    <div key={pId} className="flex justify-between items-center bg-[#222] border-2 border-[#333] p-2 shadow-[2px_2px_0_0_#111]">
                       <span className="text-xs font-bold font-sans text-zinc-300 flex items-center gap-2">
                         <span className="text-sm">{pNode?.icon}</span> {pNode?.name}
                       </span>
                       <Button variant="ghost" size="sm" onClick={() => handleRemoveParent(pId)} className="h-6 px-2 text-red-400 hover:text-red-300 hover:bg-transparent">
                          Disconnect
                       </Button>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex gap-2">
               <select 
                 value={selectedParentId}
                 onChange={e => setSelectedParentId(e.target.value)}
                 className="flex-1 bg-[#111] border-2 border-[#333] text-white p-2 text-xs font-bold outline-none focus-visible:border-[#3b82f6]"
               >
                  <option value="">-- Connect to Skill --</option>
                  {unlinkedNodes.map((n: any) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
               </select>
            </div>
          </div>
        

        <DialogFooter>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isSaving}
            className="bg-[#3b82f6] hover:brightness-110 text-black font-black uppercase tracking-wider w-full rounded-none border-2 border-black shadow-[4px_4px_0_0_#111] active:translate-y-1 active:shadow-none transition-all"
          >
            {isSaving ? "Syncing..." : "Commit Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
