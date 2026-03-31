import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    
    // Hapus cookie dengan menimpanya dan set maxAge ke 0
    cookieStore.set('taproute_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });

    return NextResponse.json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('[API/logout] Error:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan logout.' },
      { status: 500 }
    );
  }
}
