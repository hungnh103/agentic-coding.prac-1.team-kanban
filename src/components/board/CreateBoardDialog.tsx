"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCreateBoard } from "@/hooks/useBoards"

export function CreateBoardDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const createBoard = useCreateBoard()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    await createBoard.mutateAsync({ name: name.trim(), description: description.trim() || undefined })
    setName("")
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tạo board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo board mới</DialogTitle>
            <DialogDescription>
              Đặt tên cho board của bạn để bắt đầu quản lý công việc nhóm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {createBoard.error && (
              <p className="text-sm text-destructive">
                {createBoard.error.message}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="board-name">Tên board *</Label>
              <Input
                id="board-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Sprint Q1 2025"
                required
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-description">Mô tả (tùy chọn)</Label>
              <Textarea
                id="board-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về mục đích của board..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={!name.trim() || createBoard.isPending}>
              {createBoard.isPending ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
