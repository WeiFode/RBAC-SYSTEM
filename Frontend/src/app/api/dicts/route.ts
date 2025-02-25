import { NextResponse } from 'next/server';
import { $serverReq } from '@/utils/serverRequest';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'ROLE_TYPE';
    const data = await $serverReq.get(`/dicts?type=${type}`);
    return NextResponse.json(data);
  }  catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}