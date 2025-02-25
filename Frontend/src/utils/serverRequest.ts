import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const baseUrl = process.env.API_BASE_URL + '/api/v1';
interface ExtendedRequestInit extends RequestInit {
  responseType?: 'json' | 'arraybuffer' | 'blob' | 'text';
}

export const serverRequest = async (url: string, options: ExtendedRequestInit = {}) => {
  const session = await getServerSession(authOptions);
  const headers = new Headers(options.headers || {});

  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  });

  let data;
  if (options.responseType === 'arraybuffer') {
    data = await response.arrayBuffer();
  } else if (options.responseType === 'blob') {
    data = await response.blob();
  } else if (options.responseType === 'text') {
    data = await response.text();
  } else {
    // 默认为 json
    data = await response.json();
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(JSON.stringify({
        status: 401,
        message: "无效或者过期的token"
      }));
    }
    
    throw new Error(JSON.stringify({
      status: response.status,
      message: data?.message || '未知错误'
    }));
  }

  return data;
};

export const $serverReq = {
  get: (url: string, options?: ExtendedRequestInit) => serverRequest(url, { ...options, method: 'GET' }),
  post: (url: string, data: any, options?: RequestInit) => serverRequest(url, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    body: JSON.stringify(data),
  }),
  put: (url: string, data: any, options?: RequestInit) => serverRequest(url, {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    body: JSON.stringify(data),
  }),
  delete: (url: string, options?: RequestInit) => serverRequest(url, { ...options, method: 'DELETE' }),
  postFormData: (url: string, formData: FormData, options?: RequestInit) => serverRequest(url, {
    ...options,
    method: 'POST',
    // headers: { 'Content-Type': 'multipart/form-data' },
    body: formData,
  }),
  putFormData: (url: string, formData: FormData, options?: RequestInit) => serverRequest(url, {
    ...options,
    method: 'PUT',
    // headers: { 'Content-Type': 'multipart/form-data' },
    body: formData,
  }),
};