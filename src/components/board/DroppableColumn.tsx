"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface DroppableColumnProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function DroppableColumn({ id, children, className }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-h-[100px] rounded-md transition-colors",
        isOver && "bg-accent/50",
        className
      )}
    >
      {children}
    </div>
  )
}
