"use client"

import { DragOverlay as DndDragOverlay } from "@dnd-kit/core"

interface DragOverlayProps {
  children: React.ReactNode | null
}

export function DragOverlay({ children }: DragOverlayProps) {
  return (
    <DndDragOverlay dropAnimation={null}>
      {children ? (
        <div className="opacity-90 rotate-2 shadow-2xl">
          {children}
        </div>
      ) : null}
    </DndDragOverlay>
  )
}
