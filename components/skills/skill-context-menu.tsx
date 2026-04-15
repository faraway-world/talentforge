"use client"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface SkillContextMenuProps {
  children: React.ReactNode
  onEdit: () => void
  onConnectTo: () => void
  onDelete: () => void
}

export function SkillContextMenu({ children, onEdit, onConnectTo, onDelete }: SkillContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#1e1e1e] text-white border-[#555] font-mono">
        <ContextMenuItem onClick={onEdit} className="focus:bg-[#2d2d2d] focus:text-white cursor-pointer">
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={onConnectTo} className="focus:bg-[#2d2d2d] focus:text-white cursor-pointer">
          Connect To...
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="text-red-500 focus:bg-red-500/20 focus:text-red-500 cursor-pointer">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
