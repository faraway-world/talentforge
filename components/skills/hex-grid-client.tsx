"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, useAnimation } from "framer-motion"
import { generateHexGrid, axialToPixel, HEX_WIDTH, HEX_HEIGHT, generateHexEdgePath, pixelToAxial } from "./hex-board-utils"
import { addPrerequisite, updateSkillCoordinates } from "@/app/(modules)/skills/actions"
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu"
import { FlashWrapper } from "@/components/ui/flash-wrapper"
import { CreateSkillModal } from "./create-skill-modal"
import { EditSkillModal } from "./edit-skill-modal"
import { Plus, Book, Search, Move } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function HexGridClient({ initialNodes }: { initialNodes: any[] }) {
  const [localNodes, setLocalNodes] = useState(initialNodes)
  useEffect(() => { setLocalNodes(initialNodes) }, [initialNodes])
  
  const [scale, setScale] = useState(1)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState({ q: 0, r: 0 })
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)

  // Generate a fixed 15 radius grid for background slots
  const gridCells = useRef(generateHexGrid(15)).current

  const controls = useAnimation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")

  const [linkingFromId, setLinkingFromId] = useState<string | null>(null)
  
  // Pick-and-place state
  const [pickedUpNodeId, setPickedUpNodeId] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  const router = useRouter()
  
  // Escape / Right-click: cancel pick-up or linking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLinkingFromId(null)
        setPickedUpNodeId(null)
      }
    }
    const handleContextMenu = (e: globalThis.MouseEvent) => {
      if (pickedUpNodeId) {
        e.preventDefault() // Prevent context menu when cancelling pick-up
        setPickedUpNodeId(null)
      }
      setLinkingFromId(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [pickedUpNodeId])

  // Track mouse for ghost node
  useEffect(() => {
    if (!pickedUpNodeId) return
    
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [pickedUpNodeId])

  const isDraggingMap = useRef(false)
  const dragStartPos = useRef({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    isDraggingMap.current = false
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - dragStartPos.current.x
    const dy = e.clientY - dragStartPos.current.y
    if (Math.sqrt(dx*dx + dy*dy) > 5) {
      isDraggingMap.current = true
    } else {
      setTimeout(() => { isDraggingMap.current = false }, 50)
    }
  }

  const getEmoji = (iconName: string | null) => {
    if (!iconName) return null;
    const map: Record<string, string> = {
      "book": "📖", "sword": "⚔️", "shield": "🛡️", "star": "⭐", "rocket": "🚀", "lightning": "⚡", "brain": "🧠",
      "monitor": "🖥️", "code": "💻", "database": "💾", "server": "🗄️", "globe": "🌐", "lock": "🔒", "bug": "🐛",
      "axe": "🪓", "pickaxe": "⛏️", "diamond": "💎", "shovel": "🪏", "heart": "❤️", "hammer": "🔨"
    };
    return map[iconName.toLowerCase()] || iconName;
  }

  const handleLocate = (q: number, r: number, id: string) => {
    const pix = axialToPixel(q, r)
    controls.start({ x: -pix.x, y: -pix.y })
    setSheetOpen(false)
    window.location.hash = ''
    setTimeout(() => {
      window.location.hash = `#skill-${id}`
    }, 100)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomSensitivity = 0.002
    setScale(prev => Math.min(Math.max(0.2, prev - e.deltaY * zoomSensitivity), 3))
  }

  // Click 2 (empty hex): Place the picked-up node here
  const handleEmptyHexClick = async (q: number, r: number) => {
    if (isDraggingMap.current) return;
    
    // If a node is picked up, place it at this hex
    if (pickedUpNodeId) {
      const nodeId = pickedUpNodeId
      setPickedUpNodeId(null)
      
      // Optimistic update
      setLocalNodes(prev => prev.map(n => n.id === nodeId ? { ...n, q, r } : n))
      
      // Persist to DB
      await updateSkillCoordinates(nodeId, q, r)
      router.refresh()
      return
    }
    
    if (linkingFromId) return;
    setSelectedCoords({ q, r })
    setCreateModalOpen(true)
  }

  // Click 1 (skill node): Pick it up, or handle linking/edit
  const handleSkillClick = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (isDraggingMap.current) return;
    
    // If linking mode, complete the link
    if (linkingFromId) {
      if (linkingFromId !== id) {
        await addPrerequisite(linkingFromId, id)
      }
      setLinkingFromId(null)
      return;
    }
    
    // If a different node is already picked up, place it at this node's position?  
    // No — clicking a skill while another is picked up should cancel the pick-up.
    if (pickedUpNodeId) {
      setPickedUpNodeId(null)
      return;
    }
    
    // Open edit modal
    setSelectedSkillId(id)
    setEditModalOpen(true)
  }

  // Pick up a node via context menu
  const handlePickUpNode = useCallback((nodeId: string) => {
    setPickedUpNodeId(nodeId)
  }, [])

  // Draw links between nodes — hide lines for picked-up node
  const renderLinks = () => {
    const lines: React.ReactNode[] = []
    localNodes.forEach(node => {
      node.parents.forEach((parentId: string) => {
        const parentNode = localNodes.find(n => n.id === parentId)
        if (parentNode && typeof parentNode.q === 'number' && typeof parentNode.r === 'number' && typeof node.q === 'number' && typeof node.r === 'number') {
          if ((parentNode.q !== 0 || parentNode.r !== 0) && (node.q !== 0 || node.r !== 0)) {
            // Hide lines for picked-up node
            const isConnectedToPickedUp = pickedUpNodeId === node.id || pickedUpNodeId === parentId
            
            lines.push(
              <motion.path 
                key={`${parentId}-${node.id}`}
                d={generateHexEdgePath({q: parentNode.q, r: parentNode.r}, {q: node.q, r: node.r})}
                fill="none"
                stroke={node.isUnlocked ? "#4ade80" : "#333"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={node.isUnlocked ? "drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" : ""}
                animate={{ opacity: isConnectedToPickedUp ? 0 : 1 }}
                transition={{ duration: isConnectedToPickedUp ? 0.12 : 0.35, ease: "easeInOut" }}
              />
            )
          }
        }
      })
    })
    return lines;
  }

  // Get the picked-up node data for the ghost
  const pickedUpNode = pickedUpNodeId ? localNodes.find(n => n.id === pickedUpNodeId) : null

  // Current cursor mode
  const cursorMode = pickedUpNodeId ? 'none' : linkingFromId ? 'crosshair' : 'default'

  return (
    <div 
      className="w-full h-[calc(100vh-2rem)] bg-[#0a0a0a] overflow-hidden relative"
      onWheel={handleWheel}
      style={{ cursor: cursorMode }}
    >
      {/* HUD: Linking mode */}
      {linkingFromId && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-green-400 font-mono text-xl pointer-events-none drop-shadow-[0_0_8px_rgba(74,222,128,1)] border border-green-500 bg-black/80 px-4 py-2">
          [ SYSTEM : SELECT TARGET NODE ]
        </div>
      )}

      {/* HUD: Pick-up mode */}
      {pickedUpNodeId && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-[#60a5fa] font-mono text-xl pointer-events-none drop-shadow-[0_0_8px_rgba(96,165,250,1)] border border-[#60a5fa] bg-black/80 px-4 py-2 flex items-center gap-3">
          <Move size={18} />
          [ CLICK EMPTY HEX TO PLACE • ESC / RIGHT-CLICK TO CANCEL ]
        </div>
      )}

        <motion.div 
        ref={containerRef}
        className={`absolute inset-0 touch-none ${pickedUpNodeId ? '' : linkingFromId ? '' : 'active:cursor-grabbing cursor-grab'}`}
        drag={!pickedUpNodeId}
        dragConstraints={{ left: -3000, right: 3000, top: -3000, bottom: 3000 }}
        dragElastic={0.1}
        animate={controls}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{
           scale, // Framer Motion handles scale
        }}
      >
        <div className="absolute top-[50vh] left-[50vw]">
        <svg className="absolute inset-0 overflow-visible pointer-events-none" style={{ zIndex: 0 }}>
          {renderLinks()}
        </svg>

        {/* Empty Grid Cells */}
        {gridCells.map(cell => {
          const pix = axialToPixel(cell.q, cell.r)
          const hasSkill = localNodes.some(n => n.q === cell.q && n.r === cell.r)
          if (hasSkill) return null

          return (
            <div
              key={`empty-${cell.q}-${cell.r}`}
              className={`absolute group transition-opacity cursor-pointer pointer-events-auto ${pickedUpNodeId ? 'opacity-40 hover:opacity-100' : 'opacity-20 hover:opacity-100'}`}
              style={{
                left: pix.x,
                top: pix.y,
                width: HEX_WIDTH,
                height: HEX_HEIGHT,
                transform: 'translate(-50%, -50%)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                backgroundColor: pickedUpNodeId ? 'rgba(96,165,250,0.06)' : 'rgba(255,255,255,0.02)',
                border: '1px solid #333'
              }}
              onClick={() => handleEmptyHexClick(cell.q, cell.r)}
            >
               {/* Faint dot or plus in center */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100">
                  <Plus size={16} className={pickedUpNodeId ? "text-[#60a5fa]" : "text-[#4ade80]"} />
               </div>
            </div>
          )
        })}

        {/* Skill Nodes */}
        {localNodes.map(node => {
          const pix = axialToPixel(node.q, node.r)
          // Level colors roughly scaling up
          const glowColors = ['#111', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#fbbf24']
          const glowColor = glowColors[Math.min(node.level, 5)]
          const isPickedUp = pickedUpNodeId === node.id

          return (
            <ContextMenu key={node.id}>
              <ContextMenuTrigger asChild>
                <FlashWrapper
                  id={`node-${node.id}`}
                  className={`absolute group transition-all duration-300 cursor-pointer ${node.isInteractable ? 'pointer-events-auto opacity-100 hover:z-50' : 'pointer-events-none opacity-40'} ${isPickedUp ? '!opacity-20 pointer-events-none' : ''}`}
                  style={{
                    left: pix.x,
                    top: pix.y,
                    width: HEX_WIDTH,
                    height: HEX_HEIGHT,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                    onClick={(e) => handleSkillClick(node.id, e as unknown as React.MouseEvent)}
                  >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <polygon 
                        points="50,0 100,25 100,75 50,100 0,75 0,25" 
                        fill="none" 
                        stroke={node.isUnlocked ? glowColor : '#333'} 
                        strokeWidth="2"
                        transform={`scale(${HEX_WIDTH*0.9/100}, ${HEX_HEIGHT*0.9/100})`}
                      />
                    </svg>
                    
                    <span className="text-2xl mb-1 relative z-10 font-sans">{getEmoji(node.emoji || node.icon)}</span>
                    <span className="text-[10px] font-black uppercase text-white truncate max-w-full tracking-wider leading-tight relative z-10 mix-blend-difference">
                      {node.name}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 absolute bottom-2 mix-blend-difference opacity-0 group-hover:opacity-100 transition-opacity">
                      LVL {node.level}
                    </span>
                  </div>
                </FlashWrapper>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-[#1a1a1a] border-2 border-[#333] font-mono text-xs w-48 shadow-[4px_4px_0_0_#111] p-0 rounded-none text-zinc-400">
                <ContextMenuItem 
                   className="rounded-none focus:bg-[#333] focus:text-[#4ade80] py-3 cursor-pointer"
                   onSelect={() => { setSelectedSkillId(node.id); setEditModalOpen(true); }}
                >
                  Edit Skill
                </ContextMenuItem>
                <ContextMenuItem 
                   className="rounded-none focus:bg-[#333] focus:text-[#60a5fa] py-3 cursor-pointer border-t border-[#333]"
                   onSelect={() => handlePickUpNode(node.id)}
                >
                  <Move size={14} className="mr-2 inline" /> Pick Up & Move
                </ContextMenuItem>
                <ContextMenuItem 
                   className="rounded-none focus:bg-[#333] focus:text-[#4ade80] py-3 cursor-pointer border-t border-[#333]"
                   onSelect={(e) => { e.preventDefault(); setLinkingFromId(node.id); }}
                >
                  Neural Link To...
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )
        })}
        </div>
      </motion.div>

      {/* Ghost node that follows cursor */}
      {pickedUpNode && (
        <div 
          className="fixed pointer-events-none z-[999]"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            width: HEX_WIDTH,
            height: HEX_HEIGHT,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-center animate-pulse">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polygon 
                points="50,0 100,25 100,75 50,100 0,75 0,25" 
                fill="rgba(96,165,250,0.1)" 
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="6 3"
                transform={`scale(${HEX_WIDTH*0.9/100}, ${HEX_HEIGHT*0.9/100})`}
              />
            </svg>
            <span className="text-2xl mb-1 relative z-10 font-sans drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
              {getEmoji(pickedUpNode.emoji || pickedUpNode.icon)}
            </span>
            <span className="text-[10px] font-black uppercase text-[#60a5fa] truncate max-w-full tracking-wider leading-tight relative z-10 drop-shadow-[0_0_4px_rgba(96,165,250,0.8)]">
              {pickedUpNode.name}
            </span>
          </div>
        </div>
      )}

      <CreateSkillModal 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        q={selectedCoords.q} 
        r={selectedCoords.r} 
      />
      
      {selectedSkillId && (
        <EditSkillModal 
          isOpen={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          skillId={selectedSkillId} 
          nodes={initialNodes}
        />
      )}

      <Button 
        onClick={() => setSheetOpen(true)}
        className="absolute bottom-6 right-6 z-40 bg-[#111] border-2 border-[#333] text-[#4ade80] hover:bg-[#222] font-mono tracking-widest uppercase font-bold shadow-[4px_4px_0_0_#000] rounded-none h-12 px-6 hover:shadow-none hover:translate-y-1 transition-all"
      >
        <Book className="mr-3 h-5 w-5" /> Codex
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="bg-[#1a1a1a] border-l-4 border-[#333] text-white p-0 font-mono w-[400px]">
          <div className="p-6 border-b-2 border-[#333] bg-[#0a0a0a]">
            <SheetHeader>
              <SheetTitle className="text-[#3b82f6] uppercase tracking-widest font-black text-2xl flex items-center gap-3">
                <Book /> Skill Codex
              </SheetTitle>
            </SheetHeader>
            <div className="flex items-center gap-3 mt-6 bg-[#111] px-3 py-2 border-2 border-[#333]">
              <Search className="text-zinc-500" size={18} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search nodes..." 
                className="bg-transparent border-none outline-none w-full text-white placeholder-zinc-600"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-160px)] custom-scroll filter-container p-4 flex flex-col gap-2" onWheel={(e) => e.stopPropagation()}>
            {localNodes
              .filter(n => n.name.toLowerCase().includes(search.toLowerCase()) || n.category?.toLowerCase().includes(search.toLowerCase()))
              .map(node => (
                <button 
                  key={node.id}
                  onClick={() => handleLocate(node.q, node.r, node.id)}
                  className="flex flex-col text-left p-3 border-2 border-[#333] bg-[#111] hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition-colors group"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xl mr-3 bg-[#2d2d2d] border border-[#555] p-2 flex items-center justify-center font-sans tracking-normal shadow-[2px_2px_0_0_#111]">
                    {getEmoji(node.emoji || node.icon)}
                  </div>
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      {node.name}
                    </span>
                    <span className="text-[10px] text-[#4ade80] font-black bg-black px-1.5 py-0.5 border border-[#333]">LVL {node.level}</span>
                  </div>
                  <div className="flex gap-4 mt-2 px-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Q: {node.q} / R: {node.r}</span>
                    <span>HR: {node.totalHours || 0}</span>
                  </div>
                </button>
            ))}
            {initialNodes.length === 0 && <p className="text-zinc-600 text-sm italic text-center mt-10">No skills identified.</p>}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
