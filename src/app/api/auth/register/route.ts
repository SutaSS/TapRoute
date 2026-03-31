// ============================================================
// TapRoute — API: POST /api/auth/register
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Semua field (name, email, password) wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Email sudah terdaftar. Silakan login.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat new User dengan id random UUID langsung dari Prisma Node (agar konsisten)
    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
      },
    });

    // Set HTTP-Only Cookie untuk session
    const response = NextResponse.json<ApiResponse<{ id: string; name: string }>>({
      data: { id: newUser.id, name: newUser.name || '' },
      message: 'Registrasi berhasil',
    });

    response.cookies.set('taproute_session', newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (error) {
    console.error('[API/register] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal melakukan registrasi.' },
      { status: 500 }
    );
  }
}
