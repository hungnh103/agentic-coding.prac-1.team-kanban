import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sinh ra giá trị order theo fractional indexing
 * Để chèn giữa 2 items: (before + after) / 2
 * Mặc định các items cách nhau 1000 đơn vị
 */
export function generateOrder(before?: number, after?: number): number {
  if (before === undefined && after === undefined) {
    return 1000
  }
  if (before === undefined) {
    return (after as number) / 2
  }
  if (after === undefined) {
    return before + 1000
  }
  return (before + after) / 2
}

/**
 * Format thời gian tương đối (VD: "2 phút trước", "hôm qua")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = typeof date === "string" ? new Date(date) : date
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "vừa xong"
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays === 1) return "hôm qua"
  if (diffDays < 7) return `${diffDays} ngày trước`
  return d.toLocaleDateString("vi-VN")
}
