"use client"

import { useState, isValidElement, ReactNode, useRef } from "react"
import { addTask } from "@/app/(modules)/tasks/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ReferenceMenu } from "../notes/reference-menu"

export function TaskForm({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [description, setDescription] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const [triggerIndex, setTriggerIndex] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleRefSelect = (type: string, id: string, label: string) => {
    const textBefore = description.substring(0, triggerIndex)
    const textAfter = description.substring(triggerIndex + 1)
    const displayType = type.charAt(0).toUpperCase() + type.slice(1)
    setDescription(textBefore + `[[ ${displayType} : ${label} | ${id} ]]` + textAfter)
    setMenuOpen(false)
    setTriggerIndex(-1)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

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
    const top = span.offsetTop - el.scrollTop
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

  // clear states on open change
  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setDescription("")
      setMenuOpen(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const result = await addTask(formData)
    
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      handleOpenChange(false)
    }
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {isValidElement(children) ? (
        <DialogTrigger render={children} />
      ) : (
        <DialogTrigger render={<Button />}>
          {children || "Add Task"}
        </DialogTrigger>
      )}
      <DialogContent className="bg-[#1a1a1a] border-4 border-[#333] text-white font-mono shadow-[8px_8px_0_0_#111] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-widest text-white">New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="title" className="font-bold uppercase text-zinc-400">Title</Label>
            <Input id="title" name="title" required className="bg-[#111] border-2 border-[#555] rounded-none focus-visible:ring-0 focus-visible:border-[#f472b6] text-lg font-bold h-12" placeholder="What needs to be done?" />
          </div>

          <div className="flex flex-col gap-3 relative">
            <Label htmlFor="description" className="font-bold uppercase text-zinc-400 flex justify-between w-full">
              <span>Description</span>
              <span className="text-[10px] text-zinc-600">Type @ for refs</span>
            </Label>
            <textarea
              ref={textareaRef}
              id="description" 
              name="description"
              value={description}
              onChange={handleTextareaChange}
              className="bg-[#111] border-2 border-[#555] rounded-none focus-visible:ring-0 focus-visible:border-[#f472b6] text-white p-3 font-mono outline-none min-h-[100px] resize-none" 
              placeholder="Task details... @ to link skills or finance logs"
            />
            {menuOpen && (
              <ReferenceMenu 
                isOpen={menuOpen} 
                onSelect={handleRefSelect} 
                onClose={() => setMenuOpen(false)} 
                position={menuPos} 
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="priority" className="font-bold uppercase text-zinc-400">Priority</Label>
            <select id="priority" name="priority" required defaultValue="MEDIUM" className="bg-[#111] border-2 border-[#555] rounded-none focus-visible:ring-0 focus-visible:border-[#f472b6] text-white p-3 font-mono cursor-pointer outline-none">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="status" className="font-bold uppercase text-zinc-400">Initial Status</Label>
            <select id="status" name="status" required defaultValue="TODO" className="bg-[#111] border-2 border-[#555] rounded-none focus-visible:ring-0 focus-visible:border-[#f472b6] text-white p-3 font-mono cursor-pointer outline-none">
              <option value="TODO">Planned</option>
              <option value="IN_PROGRESS">Active</option>
              <option value="DONE">Mastered</option>
            </select>
          </div>

          {error && <div className="text-red-400 font-bold bg-red-950/50 p-3 border-l-4 border-red-500">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full bg-[#f472b6] text-black font-black uppercase tracking-wider h-14 hover:bg-[#ec4899] transition-transform active:translate-y-1 rounded-none mt-4 text-lg" style={btnBorder}>
            {loading ? "Saving..." : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
