"use client"

import { useState, useRef } from "react"
import { MarkdownRenderer } from "./markdown-renderer"
import { ReferenceMenu } from "./reference-menu"
import { saveNote, deleteNote } from "@/app/(modules)/notes/actions"
import { Save, Plus, Terminal, MoreVertical, Trash, Edit2 } from "lucide-react"

export function WikiClient({ initialNotes }: { initialNotes: any[] }) {
  const [notes, setNotes] = useState(initialNotes)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(initialNotes[0]?.id || null)
  
  const activeNote = notes.find(n => n.id === activeNoteId) || null
  const [title, setTitle] = useState(activeNote?.title || "")
  const [content, setContent] = useState(activeNote?.content || "")
  const [isEditing, setIsEditing] = useState(false)

  // Reference Menu State
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [triggerIndex, setTriggerIndex] = useState(-1) // where the @ was typed

  // Sidebar Menu State
  const [contextNoteId, setContextNoteId] = useState<string | null>(null)

  const handleRefSelect = (type: string, id: string, label: string) => {
    const textBefore = content.substring(0, triggerIndex)
    const textAfter = content.substring(triggerIndex + 1)
    // Capitalize type for display: skill -> Skill
    const displayType = type.charAt(0).toUpperCase() + type.slice(1)
    setContent(textBefore + `[[ ${displayType} : ${label} | ${id} ]]` + textAfter)
    setMenuOpen(false)
    setTriggerIndex(-1)
    // Return focus to textarea
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
    // Offset by scrollTop and scrollLeft of textarea
    const top = span.offsetTop - el.scrollTop
    const left = span.offsetLeft - el.scrollLeft
    document.body.removeChild(div)
    return { top, left }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    // If user deleted the @, close menu
    if (menuOpen && triggerIndex !== -1 && val[triggerIndex] !== '@') {
      setMenuOpen(false)
    }

    // Check if newly typed char was @
    if (e.target.selectionEnd && val[e.target.selectionEnd - 1] === '@') {
      const coords = getCaretPos(e.target)
      setMenuPos(coords)
      setMenuOpen(true)
      setTriggerIndex(e.target.selectionEnd - 1)
    }

    setContent(val)
  }

  const switchNote = (id: string) => {
    const nextNote = notes.find(n => n.id === id)
    setActiveNoteId(id)
    if(nextNote) {
      setTitle(nextNote.title)
      setContent(nextNote.content)
      setIsEditing(false)
    }
  }

  const handleCreate = () => {
    setActiveNoteId("new")
    setTitle("New Note")
    setContent("")
    setIsEditing(true)
  }

  const handleSave = async () => {
    const res = await saveNote(activeNoteId === "new" ? null : activeNoteId, title, content, "General")
    if (res.success && res.note) {
      const isNew = activeNoteId === "new"
      setNotes(isNew ? [res.note, ...notes] : notes.map(n => n.id === activeNoteId ? res.note : n))
      setActiveNoteId(res.note.id)
      setIsEditing(false)
    }
  }

  const handleDeleteNode = async (id: string) => {
    if (confirm("Delete this note?")) {
      const res = await deleteNote(id)
      if (res.success) {
         setNotes(notes => notes.filter(n => n.id !== id))
         if (activeNoteId === id) {
           const next = notes.find(n => n.id !== id && n.id !== "new")
           if (next) switchNote(next.id)
           else setActiveNoteId(null)
         }
      }
    }
  }

  return (
    <div className="flex h-[800px] border-4 border-[#333] shadow-[8px_8px_0_0_#111] bg-black font-mono">
      {/* Sidebar */}
      <div className="w-64 border-r-4 border-[#333] flex flex-col">
        <div className="p-4 border-b-4 border-[#333] flex justify-between items-center bg-[#111]">
          <h2 className="text-[#4ade80] font-black uppercase tracking-widest flex items-center gap-2"><Terminal size={18}/> WIKI</h2>
          <button onClick={handleCreate} className="text-[#4ade80] hover:text-white"><Plus size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 bg-[#0a0a0a]">
          {notes.map(note => (
            <div key={note.id} className="relative group" onMouseLeave={() => setContextNoteId(null)}>
              <div className={`flex items-center ${activeNoteId === note.id ? 'bg-[#333] text-[#4ade80] border-l-2 border-[#4ade80]' : 'text-zinc-500 hover:bg-[#111] hover:text-zinc-300'}`}>
                <button 
                  onClick={() => switchNote(note.id)}
                  className="flex-1 text-left px-3 py-2 text-sm truncate font-bold"
                >
                  &gt; {note.title}
                </button>
                <button 
                  onClick={() => setContextNoteId(contextNoteId === note.id ? null : note.id)} 
                  className={`px-2 transition-opacity ${contextNoteId === note.id ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 hover:text-white'}`}
                >
                  <MoreVertical size={14} />
                </button>
              </div>
              {contextNoteId === note.id && (
                <div className="absolute top-8 right-2 z-50 bg-[#1e1e1e] border-2 border-[#555] shadow-lg flex flex-col font-mono text-xs w-28">
                   <button 
                     className="flex items-center gap-2 p-2 hover:bg-[#333] text-zinc-300 transition-colors" 
                     onClick={() => { switchNote(note.id); setIsEditing(true); setContextNoteId(null); }}
                   >
                     <Edit2 size={12}/> Rename
                   </button>
                   <button 
                     className="flex items-center gap-2 p-2 hover:bg-[#333] text-red-500 transition-colors" 
                     onClick={() => { handleDeleteNode(note.id); setContextNoteId(null); }}
                   >
                     <Trash size={12}/> Delete
                   </button>
                </div>
              )}
            </div>
          ))}
          {activeNoteId === "new" && (
             <button className="text-left px-3 py-2 text-sm truncate font-bold bg-[#333] text-[#4ade80] border-l-2 border-[#4ade80]">
              &gt; {title}
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col relative text-[#4ade80]">
        {activeNoteId ? (
          <>
            <div className="p-4 border-b-4 border-[#333] flex justify-between items-center bg-[#111]">
              {isEditing ? (
                <input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="bg-transparent border-b-2 border-[#4ade80] outline-none text-xl font-black uppercase tracking-widest text-white w-1/2" 
                />
              ) : (
                <h1 className="text-xl font-black uppercase tracking-widest text-white">{title}</h1>
              )}
              
              <div className="flex gap-4">
                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="text-[#4ade80] hover:text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2 bg-[#222] px-3 py-1 border border-[#333] shadow-[2px_2px_0_0_#000]">
                  <Save size={14} /> {isEditing ? "Save" : "Edit"}
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-black bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:16px_16px] relative">
              {menuOpen && (
                <ReferenceMenu 
                  isOpen={menuOpen} 
                  onSelect={handleRefSelect} 
                  onClose={() => setMenuOpen(false)} 
                  position={menuPos} 
                />
              )}
              {isEditing ? (
                <textarea 
                   ref={textareaRef}
                   value={content}
                   onChange={handleTextareaChange}
                   onClick={() => setMenuOpen(false)}
                   className="w-full h-full bg-transparent outline-none resize-none text-[#4ade80] font-mono leading-relaxed"
                   placeholder="Write your note... use @ to reference a module."
                />
              ) : (
                <MarkdownRenderer content={content} />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-sm">
            Select or create a note
          </div>
        )}
      </div>
    </div>
  )
}
