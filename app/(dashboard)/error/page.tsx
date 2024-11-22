'use client'
// app/error/page.tsx
//import { auth, signIn } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { useSession, signIn } from 'next-auth/react';
import { useSearchParams, useRouter, redirect } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const logIn = async (callback: string) => {
  //await signIn('keycloak', { redirectTo: callback });
  await signIn('keycloak', {redirectTo: callback});
}

// export default async function ErrorPage (
//   props: {
//     searchParams: Promise<{ status: string; from: string | null }>;
//   }
// ) {
export default function ErrorPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('status') || '500';
  const fromUrl = searchParams.get('from') || '/';
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status ==='loading') return;
    if (code === '401')
      if (session?.expired) {
        console.log(`[login] status: ${status}, code: ${code}, uesr: ${session?.user}`)
        logIn(fromUrl);
      } else {
        console.log(`[redirect] status: ${status}, code: ${code}, uesr: ${session?.user}`)
        router.push(fromUrl);
      }
  }, [status, session])

  let message;
  switch (code) {
    case '401': 
      message = '인증이 필요합니다. 로그인 창으로 이동합니다.';
      if (status === 'authenticated' && session && !session.expired)
        message = '인증되었습니다. 요청하신 페이지로 이동합니다.';
      break;
    case '403':
      message = '권한이 없습니다. 관리자에게 권한을 요청하세요.';
      break;
    case '404':
      message = '해당 주소에 맞는 페이지가 없습니다.';
      break;
    default:
      message = '알 수 없는 오류가 발생하였습니다.';
  }
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{code}</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        { (!session || session.expired) && 
        (<CardFooter>
          <form
            action={async () => {
              logIn(fromUrl);
            }}
            className="w-full"
          >
            <Button className="w-full">Sign In</Button>
          </form>
        </CardFooter>)}
      </Card>
    </div>
  );
};

