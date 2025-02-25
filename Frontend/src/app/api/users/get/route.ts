import { NextRequest, NextResponse } from 'next/server';
import { $serverReq } from '@/utils/serverRequest';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const departmentId = searchParams.get('departmentID') || '';
    const name = searchParams.get('name') || '';
    const email = searchParams.get('email') || '';
    const roles = searchParams.get('roles') || '';

    const data = await $serverReq.get(`/users?page=${page}&pageSize=${pageSize}&name=${name}&email=${email}&roles=${roles}&departmentID=${departmentId}`);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}