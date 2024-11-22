import type { NextRequest } from 'next/server';
import { auth, signIn  } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const middleware = async (req : NextRequest) => {
  const { pathname } = req.nextUrl;
  const session = await auth();
  const url = new URL(pathname, req.url);
  const fromUrl = encodeURIComponent(url.toString());

  if (!session || !session.user?.name || session.expired) {
    return NextResponse.redirect(new URL(`/error?status=401&from=${fromUrl}`, req.url));
  }

  if (pathname.startsWith('/admin')) {  
    if (!session || !session.roles.includes("adminx"))
      return NextResponse.redirect(new URL(`/error?status=403&from=${fromUrl}`, req.url));
  }
  return NextResponse.next();
}

// Don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|login|error|favicon.ico|.*\.(?:jpg|svg|png)).*)']
}
