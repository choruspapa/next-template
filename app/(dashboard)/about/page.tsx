'use client'

import { useEffect, useState } from 'react';
import { useGetUserInfoQuery } from '@/lib/features/api/auth-slice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
  } from '@/components/ui/card';
  import {
    TableRow,
    TableBody,
    TableCell,
    Table
  } from '@/components/ui/table';

  
export default function AboutPage() {
  const { data, error, isLoading } = useGetUserInfoQuery();
  const router = useRouter();
  
  useEffect(() => {
    if (error && !isLoading) {
      const e = error as FetchBaseQueryError;
      const url = window.location.href;
      router.push(`/error?status=${e.status}&from=${encodeURIComponent(url)}`);
    }
  }, [error, isLoading])

  if (isLoading) {
    return <div>Loading...</div>;
  }

  
  const userInfo = data as UserInfo;
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className='text-2xl'>About me</CardTitle>
          <CardDescription>
            User information registered in authentication server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          { userInfo && (
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="hidden md:table-cell">계정명</TableCell>
                <TableCell className="hidden sm:table-cell">{userInfo.preferredUsername}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden md:table-cell">사용자명</TableCell>
                <TableCell className="font-medium">{userInfo.displayName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden md:table-cell">사원번호</TableCell>
                <TableCell className="font-medium">{userInfo.employeeId}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          )}
          </CardContent>
        <CardFooter>
          <form
            action={async () => {
              router.back();
            }}
            className="w-full"
          >
            <Button className="w-full">Go to back</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}