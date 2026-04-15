"use client"

import { useEffect, useState } from "react"
import * as HoverCard from "@radix-ui/react-hover-card"
import { getReferencePreview } from "@/app/(modules)/notes/actions"
import Link from "next/link"

type PreviewData = { title: string; detail: string; link: string } | null

export function NoteLink({ type, id, children }: { type: string; id: string; children?: React.ReactNode }) {
  const [preview, setPreview] = useState<PreviewData>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getReferencePreview(type, id).then(data => {
      if (active) {
        setPreview(data)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [type, id])

  return (
    <HoverCard.Root openDelay={200} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <Link 
          href={preview ? preview.link : "#"}
          className="inline-flex items-center px-2 py-0.5 mx-1 border-2 border-[#4ade80]/50 bg-[#111] hover:bg-[#222] transition-colors cursor-pointer text-[#4ade80] font-black tracking-widest text-xs uppercase shadow-[2px_2px_0_0_rgba(74,222,128,0.2)]"
        >
          {children || (preview ? preview.title : `[Loading...]`)}
        </Link>
      </HoverCard.Trigger>
      
      <HoverCard.Portal>
        <HoverCard.Content 
          className="z-50 bg-[#111] border-2 border-[#555] p-4 flex flex-col gap-2 shadow-[4px_4px_0_0_#4ade80] w-64 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95" 
          sideOffset={8}
        >
          {loading ? (
            <div className="text-sm text-zinc-400 font-mono animate-pulse">Loading preview...</div>
          ) : preview ? (
            <>
               <div className="text-[10px] uppercase font-black tracking-widest text-[#f472b6]">{type}</div>
               <div className="text-white font-bold text-lg leading-tight truncate">{preview.title}</div>
               <div className="text-xs border-t-2 border-[#333] pt-2 mt-1 text-[#4ade80] font-black uppercase tracking-wider">{preview.detail}</div>
            </>
          ) : (
            <div className="text-sm text-red-500 font-mono font-bold">Reference broken!</div>
          )}
          <HoverCard.Arrow className="fill-[#555]" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
