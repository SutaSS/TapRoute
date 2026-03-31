import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { ApiResponse, DayItinerary } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = cookies().get('taproute_session');
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json<ApiResponse<null>>({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = sessionCookie.value;

    const user = await (prisma.user as any).findUnique({
      where: { id: userId },
      include: { itineraries: true },
    });

    if (!user) {
      return NextResponse.json<ApiResponse<null>>({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    let totalUMKM = 0;
    let totalActivities = 0;

    user.itineraries.forEach((trip: any) => {
      let activities: any[] = [];
      try {
        const parsed = typeof trip.itineraryJson === 'string' ? JSON.parse(trip.itineraryJson) : trip.itineraryJson;
        if (Array.isArray(parsed)) {
          parsed.forEach((day: DayItinerary) => {
            day.activities.forEach((act) => {
              totalActivities++;
              if (act.umkm_flag || act.category === 'umkm') {
                totalUMKM++;
              }
            });
          });
        }
      } catch (e) {
        // Skip
      }
    });

    const impact = totalActivities > 0 ? Math.round((totalUMKM / totalActivities) * 100) : 0;

    return NextResponse.json<ApiResponse<any>>({
      data: {
        name: user.name ?? 'Traveler',
        email: user.email ?? '',
        totalTrips: user.itineraries.length,
        totalUMKM,
        impact,
      },
    });
  } catch (error) {
    console.error('[API/profile] Error:', error);
    return NextResponse.json<ApiResponse<null>>({ error: 'Server error' }, { status: 500 });
  }
}
