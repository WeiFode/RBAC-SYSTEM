import { NextResponse } from 'next/server';
import { $serverReq } from '@/utils/serverRequest';

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const data = await $serverReq.put(`/menus/${body.id}`, body);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}