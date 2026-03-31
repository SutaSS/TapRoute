// ============================================================
// TapRoute — API: POST /api/auth/login
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Cari user di database
    const user = await (prisma.user as any).findUnique({
      where: { email },
    });

    // Validasi email
    if (!user || user.password == null) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    // Validasi password
    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    // 2. Simpan session di cookies HTTP-only (durasi 7 hari)
    const cookieStore = cookies();
    cookieStore.set('taproute_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return NextResponse.json<ApiResponse<{ id: string; name: string | null; email: string | null }>>({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: 'Login berhasil',
    });
  } catch (error) {
    console.error('[API/login] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal melakukan login.' },
      { status: 500 }
    );
  }
}
