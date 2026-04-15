"use client"

import { useTransition, useState, useEffect } from "react"
import { updateTaskStatus, deleteTask, updateTaskDescription } from "@/app/(modules)/tasks/actions"
import { ListTodo, Activity, CheckCircle, Trash2, ArrowRight } from "lucide-react"
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, pointerWithin, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import { FlashWrapper } from "@/components/ui/flash-wrapper"

export function TaskBoard({ tasks }: { tasks: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleUpdate = (id: string, newStatus: string) => {
    startTransition(() => {
        updateTaskStatus(id, newStatus)
    })
  }

  const handleDelete = async (id: string) => {
    if(confirm("Delete this task forever?")) {
      await deleteTask(id)
    }
  }

  const priorityWeight: Record<string, number> = { "CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
  
  const sortTasks = (taskList: any[]) => {
    return [...taskList].sort((a, b) => {
      const pA = priorityWeight[a.priority] || 0;
      const pB = priorityWeight[b.priority] || 0;
      if (pB !== pA) return pB - pA;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }

  const planned = sortTasks(tasks.filter(t => t.status === "TODO"))
  const active = sortTasks(tasks.filter(t => t.status === "IN_PROGRESS"))
  const mastered = sortTasks(tasks.filter(t => t.status === "DONE"))

  const minecraftBorder = {
    boxShadow: `
      #111 4px 0px 0px 0px, 
      #111 -4px 0px 0px 0px, 
      #111 0px 4px 0px 0px, 
      #111 0px -4px 0px 0px, 
      #333 8px 0px 0px 0px, 
      #333 -8px 0px 0px 0px, 
      #333 0px 8px 0px 0px, 
      #333 0px -8px 0px 0px, 
      inset 4px 4px 0px 0px rgba(255,255,255,0.1),
      inset -4px -4px 0px 0px rgba(0,0,0,0.5)
    `,
    imageRendering: "pixelated" as const,
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

  const TaskCard = ({ task }: { task: any }) => {
    
    const parseReferences = (desc: string, taskId: string) => {
      if (!desc) return null;
      const refRegex = /\[\[\s*([^:]+?)\s*:\s*([^|]+?)\s*\|\s*([^\]]+?)\s*\]\]/g;
      
      const refs = [];
      let match;
      while ((match = refRegex.exec(desc)) !== null) {
        refs.push({ type: match[1].trim(), label: match[2].trim(), id: match[3].trim(), raw: match[0] });
      }

      const cleanDesc = desc.replace(refRegex, "").trim();

      const removeRef = (raw: string) => {
         const newDesc = desc.replace(raw, "").trim();
         startTransition(() => {
            updateTaskDescription(taskId, newDesc);
         });
      }

      if (!cleanDesc && refs.length === 0) return null;

      return (
         <div className="flex flex-col gap-2 relative z-20 pointer-events-auto">
            {cleanDesc && <p className="text-sm text-zinc-400 font-mono mt-1">{cleanDesc}</p>}
            {refs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {refs.map((ref, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#1a1a1a] border border-[#555] px-2 py-1 text-xs font-mono shadow-[2px_2px_0_0_#000]">
                    <span className="text-[#f472b6] font-black">{ref.type}</span>
                    <span className="text-zinc-300 font-bold">{ref.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeRef(ref.raw); }} className="text-zinc-500 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
         </div>
      )
    }

    return (
      <FlashWrapper id={`task-${task.id}`} className={`bg-[#2d2d2d] border-2 border-[#555] shadow-[4px_4px_0_0_#111] p-4 flex flex-col gap-3 group relative transition-all duration-300 z-10`}>
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-white leading-tight pr-6">{task.title}</h4>
          <button 
          onClick={() => handleDelete(task.id)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {parseReferences(task.description, task.id)}
      
      <div className="flex justify-between items-center mt-2 pointer-events-auto">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 ${
          task.priority === "CRITICAL" ? "bg-red-500 text-white" :
          task.priority === "HIGH" ? "bg-orange-500 text-white" :
          task.priority === "MEDIUM" ? "bg-[#555] text-white" : "bg-[#333] text-zinc-400"
        }`}>
          {task.priority}
        </span>
        
        <div className="flex gap-2">
          {task.status === "TODO" && (
            <button 
              onClick={() => handleUpdate(task.id, "IN_PROGRESS")}
              className="bg-[#60a5fa] text-black p-1 hover:brightness-110 active:translate-y-[1px]" style={btnBorder} title="Start task"
            >
              <ArrowRight size={14} />
            </button>
          )}
          {task.status === "IN_PROGRESS" && (
            <>
              <button 
                onClick={() => handleUpdate(task.id, "TODO")}
                className="bg-zinc-400 text-black p-1 hover:brightness-110 active:translate-y-[1px]" style={btnBorder} title="Move back to planned"
              >
                <ListTodo size={14} />
              </button>
              <button 
                onClick={() => handleUpdate(task.id, "DONE")}
                className="bg-[#4ade80] text-black p-1 hover:brightness-110 active:translate-y-[1px]" style={btnBorder} title="Complete task"
              >
                <CheckCircle size={14} />
              </button>
            </>
          )}
          {task.status === "DONE" && (
            <button 
              onClick={() => handleUpdate(task.id, "IN_PROGRESS")}
              className="bg-[#60a5fa] text-black p-1 hover:brightness-110 active:translate-y-[1px]" style={btnBorder} title="Move back to active"
            >
              <Activity size={14} />
            </button>
          )}
        </div>
      </div>
    </FlashWrapper>
    )
  }

  const DraggableTaskCard = ({ task }: { task: any }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: task.id,
      data: { task }
    })
    
    const style = transform ? {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 50 : 1,
      position: "relative" as const
    } : undefined

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <TaskCard task={task} />
      </div>
    )
  }

  const DroppableColumn = ({ id, title, Icon, colorClass, borderClass, borderColor, itemCount, children }: any) => {
    const { setNodeRef, isOver } = useDroppable({ id })
    return (
      <div ref={setNodeRef} className={`bg-[#222] p-6 relative flex flex-col gap-6 transition-colors ${isOver ? 'bg-[#2a2a2a]' : ''}`} style={minecraftBorder}>
        <div className={`flex items-center gap-3 border-b-4 ${borderClass} pb-4`}>
          <Icon className={colorClass} size={24} />
          <h3 className={`text-xl font-black uppercase ${colorClass} tracking-widest`}>{title}</h3>
          <span className={`ml-auto bg-[#111] ${colorClass} font-bold px-2 py-1 text-sm border-2 ${borderClass}`}>{itemCount}</span>
        </div>
        <div className="flex flex-col gap-4 min-h-[150px]">
          {children}
        </div>
      </div>
    )
  }

  const [activeTask, setActiveTask] = useState<any>(null)

  const handleDragStart = (event: any) => {
    setActiveTask(event.active.data.current?.task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return
    const taskId = active.id as string
    const newStatus = over.id as string
    
    const task = tasks.find(t => t.id === taskId)
    if (task && task.status !== newStatus) {
       handleUpdate(taskId, newStatus)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  if (!isMounted) return null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-10 opacity-100 transition-opacity ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
        
        <DroppableColumn id="TODO" title="Planned" Icon={ListTodo} colorClass="text-zinc-400" borderClass="border-[#333]" itemCount={planned.length}>
            {planned.map(task => <DraggableTaskCard key={task.id} task={task} />)}
            {planned.length === 0 && <div className="text-center py-8 text-zinc-600 font-bold uppercase tracking-wider text-sm pointer-events-none">Drop tasks here</div>}
        </DroppableColumn>

        <DroppableColumn id="IN_PROGRESS" title="Active" Icon={Activity} colorClass="text-[#60a5fa]" borderClass="border-[#333]" itemCount={active.length}>
            {active.map(task => <DraggableTaskCard key={task.id} task={task} />)}
            {active.length === 0 && <div className="text-center py-8 text-zinc-600 font-bold uppercase tracking-wider text-sm pointer-events-none">Drop tasks here</div>}
        </DroppableColumn>

        <DroppableColumn id="DONE" title="Mastered" Icon={CheckCircle} colorClass="text-[#4ade80]" borderClass="border-[#333]" itemCount={mastered.length}>
            {mastered.map(task => <DraggableTaskCard key={task.id} task={task} />)}
            {mastered.length === 0 && <div className="text-center py-8 text-zinc-600 font-bold uppercase tracking-wider text-sm pointer-events-none">Drop tasks here</div>}
        </DroppableColumn>

      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
