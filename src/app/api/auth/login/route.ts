// ============================================================
// TapRoute — API: POST /api/auth/login
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
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

    // Cari User
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Kredensial tidak valid.' },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Kredensial tidak valid.' },
        { status: 401 }
      );
    }

    // Set HTTP-Only Cookie untuk session
    const response = NextResponse.json<ApiResponse<{ id: string; name: string }>>({
      data: { id: user.id, name: user.name || '' },
      message: 'Login berhasil',
    });

    response.cookies.set('taproute_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    // Dummy user creation is removed because real user system is up.
    return response;
  } catch (error) {
    console.error('[API/login] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Gagal melakukan login.' },
      { status: 500 }
    );
  }
}
