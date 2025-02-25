import { NextResponse } from 'next/server';
import { $serverReq } from '@/utils/serverRequest';

export async function GET(request: any) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    const data = await $serverReq.get(`/menus/menusWithRoles?page=${page}&pageSize=${pageSize}`);
    
    return NextResponse.json(data);
  }  catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}