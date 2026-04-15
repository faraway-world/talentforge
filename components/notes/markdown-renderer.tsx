import React from "react"
import { NoteLink } from "./note-link"

export function MarkdownRenderer({ content }: { content: string }) {
  const regex = /\[\[\s*(Task|Skill|Finance)\s*:\s*(.*?)\s*\|\s*(.*?)\s*\]\]/g
  const parts = content.split(regex)

  const nodes: React.ReactNode[] = []
  for (let i = 0; i < parts.length; i += 4) {
    if (parts[i]) {
      nodes.push(<span key={`text-${i}`}>{parts[i]}</span>)
    }
    
    // parts[i+1] is type, parts[i+2] is label, parts[i+3] is id
    if (i + 3 < parts.length && parts[i + 1] !== undefined) {
      const type = parts[i + 1].toLowerCase().trim()
      const label = parts[i + 2]?.trim() || ""
      const id = parts[i + 3]?.trim() || ""
      nodes.push(
        <NoteLink key={`link-${i}`} type={type} id={id}>
          {label}
        </NoteLink>
      )
    }
  }

  return (
    <div className="whitespace-pre-wrap font-mono text-[#4ade80] leading-relaxed">
      {nodes}
    </div>
  )
}
