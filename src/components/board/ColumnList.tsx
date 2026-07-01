"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Column } from "./Column"
import { DndBoardProvider } from "./DndBoardProvider"
import { useCreateColumn } from "@/hooks/useColumns"
import type { BoardWithDetails } from "@/types"

interface ColumnListProps {
  board: BoardWithDetails
  currentUserId: string
}

export function ColumnList({ board, currentUserId }: ColumnListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const createColumn = useCreateColumn(board.id)

  async function handleAddColumn(e: React.FormEvent) {
    e.preventDefault()
    if (!newColumnName.trim()) return

    await createColumn.mutateAsync({ name: newColumnName.trim() })
    setNewColumnName("")
    setShowAddForm(false)
  }

  return (
    <DndBoardProvider board={board}>
      {(columns) => (
        <div className="flex gap-4 items-start overflow-x-auto pb-4 min-h-[400px]">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              board={board}
              currentUserId={currentUserId}
            />
          ))}

          {/* Add column form */}
          <div className="w-72 shrink-0">
            {showAddForm ? (
              <form
                onSubmit={handleAddColumn}
                className="column-shell p-3 space-y-2"
              >
                <Input
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Tên cột..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowAddForm(false)
                      setNewColumnName("")
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newColumnName.trim() || createColumn.isPending}
                  >
                    Thêm
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewColumnName("")
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm cột
              </Button>
            )}
          </div>
        </div>
      )}
    </DndBoardProvider>
  )
}
