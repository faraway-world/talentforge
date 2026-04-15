import { getSkillTree } from "./actions"
import { HexGridClient } from "@/components/skills/hex-grid-client"

export const dynamic = "force-dynamic"

export default async function SkillsPage() {
  const { nodes } = await getSkillTree()

  return (
    <main className="w-full h-full flex flex-col items-center justify-center bg-black">
      <HexGridClient initialNodes={nodes} />
    </main>
  )
}
