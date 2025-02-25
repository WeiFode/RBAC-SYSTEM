import { NextResponse } from 'next/server';
import { $serverReq } from '@/utils/serverRequest';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '菜单ID缺失' }, { status: 400 });
    }
    const body = await request.json();
    const data = await $serverReq.post(`/menus/permissions/${id}`, body);

    return NextResponse.json(data);
  }  catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}