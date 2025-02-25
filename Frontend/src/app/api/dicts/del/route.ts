import { NextResponse } from 'next/server';
import { $serverReq } from '@/utils/serverRequest';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: '用户ID缺失' }, { status: 400 });
    }

    const data = await $serverReq.delete(`/dicts/${userId}`);

    return NextResponse.json(data);
  }  catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}