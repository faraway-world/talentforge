"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- DEMO MODE: Hardcoded user for prototype showcase ---
const DEMO_USER_ID = "demo-user-123"

export async function getSkillTree() {
  const skills = await prisma.skill.findMany({
    include: {
      parents: true,
      logs: true,
      tasks: true,
    },
  })

  const skillHoursMap = new Map<string, number>()
  for (const skill of skills) {
    const totalHours = skill.logs.reduce((sum: number, log: { hours: number }) => sum + log.hours, 0)
    skillHoursMap.set(skill.id, totalHours)
  }

  const updates: { id: string, q: number, r: number }[] = [];
  const takenCoords = new Set<string>();

  const getSpiralEmpty = () => {
    let radius = 1;
    while (true) {
      let cq = 0, cr = -radius;
      const dirs = [
        { dq: 1, dr: 0 }, { dq: 0, dr: 1 }, { dq: -1, dr: 1 },
        { dq: -1, dr: 0 }, { dq: 0, dr: -1 }, { dq: 1, dr: -1 }
      ];
      for (const dir of dirs) {
        for (let i = 0; i < radius; i++) {
          if (!takenCoords.has(`${cq},${cr}`)) return { q: cq, r: cr };
          cq += dir.dq; cr += dir.dr;
        }
      }
      radius++;
    }
  }

  for (const skill of skills) {
    if (skill.coordinatesX === 0 && skill.coordinatesY === 0) {
      const newCoord = getSpiralEmpty();
      takenCoords.add(`${newCoord.q},${newCoord.r}`);
      updates.push({ id: skill.id, q: newCoord.q, r: newCoord.r });
      skill.coordinatesX = newCoord.q;
      skill.coordinatesY = newCoord.r;
    } else {
      const key = `${skill.coordinatesX},${skill.coordinatesY}`;
      if (!takenCoords.has(key)) {
        takenCoords.add(key);
      } else {
        const newCoord = getSpiralEmpty();
        takenCoords.add(`${newCoord.q},${newCoord.r}`);
        updates.push({ id: skill.id, q: newCoord.q, r: newCoord.r });
        skill.coordinatesX = newCoord.q;
        skill.coordinatesY = newCoord.r;
      }
    }
  }

  if (updates.length > 0) {
    prisma.$transaction(
      updates.map(u => prisma.skill.update({ where: { id: u.id }, data: { coordinatesX: u.q, coordinatesY: u.r } }))
    ).catch(console.error);
  }

  const nodes = skills.map((skill) => {
    const totalHours = skillHoursMap.get(skill.id) || 0;
    const isInteractable = skill.parents.every(
      (parent: { id: string }) => (skillHoursMap.get(parent.id) || 0) > 0
    );

    return {
      id: skill.id,
      name: skill.name,
      icon: skill.icon,
      level: skill.level,
      category: skill.category,
      q: skill.coordinatesX,
      r: skill.coordinatesY,
      totalHours,
      isInteractable,
      isUnlocked: totalHours > 0 || skill.level > 1,
      parents: skill.parents.map(p => p.id),
      tasks: skill.tasks
    };
  });

  return { nodes }
}

export async function updateSkillCoordinates(id: string, x: number, y: number) {
  try {
    await prisma.skill.update({
      where: { id },
      data: {
        coordinatesX: x,
        coordinatesY: y,
      },
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to update skill coordinates:", error)
    return { success: false }
  }
}

export async function createSkill(name: string, icon: string, q: number, r: number) {
  try {
    const skill = await prisma.skill.create({
      data: {
        name,
        icon,
        userId: DEMO_USER_ID,
        coordinatesX: q,
        coordinatesY: r,
        level: 1,
        category: "General"
      },
    })
    
    revalidatePath("/skills")
    return { success: true, skill }
  } catch (error) {
    console.error("Failed to create skill:", error)
    return { success: false }
  }
}

export async function addPrerequisite(parentId: string, childId: string) {
  try {
    await prisma.skill.update({
      where: { id: childId },
      data: {
        parents: {
          connect: { id: parentId }
        }
      }
    })
    
    revalidatePath("/skills")
    return { success: true }
  } catch (error) {
    console.error("Failed to add prerequisite:", error)
    return { success: false }
  }
}

export async function saveBulkCoordinates(nodes: { id: string; x: number; y: number }[]) {
  try {
    await prisma.$transaction(
      nodes.map((node) => 
        prisma.skill.update({
          where: { id: node.id },
          data: { coordinatesX: node.x, coordinatesY: node.y },
        })
      )
    )
    return { success: true }
  } catch (error) {
    console.error("Failed to save bulk coordinates:", error)
    return { success: false }
  }
}

export async function deleteSkill(id: string) {
  try {
    await prisma.skill.delete({
      where: { id }
    })
    revalidatePath("/skills")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete skill:", error)
    return { success: false }
  }
}

export async function deletePrerequisite(sourceId: string, targetId: string) {
  try {
    await prisma.skill.update({
      where: { id: targetId },
      data: {
        parents: {
          disconnect: { id: sourceId }
        }
      }
    })
    revalidatePath("/skills")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete prerequisite:", error)
    return { success: false }
  }
}

export async function editSkill(id: string, name: string, icon: string, level: number, category: string, addHours: number = 0) {
  try {
    const updateData: any = { name, icon, level, category };
    
    await prisma.skill.update({
      where: { id },
      data: updateData
    });

    if (addHours > 0) {
      await prisma.skillLog.create({
        data: {
          skillId: id,
          hours: addHours,
          notes: "Manual adjustment via Edit Modal"
        }
      });
    }

    revalidatePath("/skills")
    return { success: true }
  } catch (error) {
    console.error("Failed to edit skill:", error)
    return { success: false }
  }
}
