import { NextResponse } from 'next/server';
import { $serverReq } from '@/utils/serverRequest';

export async function GET(request: any) {
  try {
    const data = await $serverReq.get('/menus/getRoutes');

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}