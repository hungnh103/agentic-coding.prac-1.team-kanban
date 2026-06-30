import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  // Rate limit: 10 register attempts per IP per 15 minutes
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
  const { allowed, retryAfterMs } = rateLimit(`register:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 })
  if (!allowed) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  try {
    const body = await req.json()
    const { name, email, password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tên, email và mật khẩu là bắt buộc" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Định dạng email không hợp lệ" },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length < 1 || name.trim().length > 100) {
      return NextResponse.json(
        { error: "Tên phải từ 1 đến 100 ký tự" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 8 ký tự" },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng" },
        { status: 409 }
      )
    }

    // Hash password with cost factor 12
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Lỗi server, vui lòng thử lại" },
      { status: 500 }
    )
  }
}
