'use client';

import { AppShell } from '@/components/dashboard/app-shell';
import { adminNavItems } from '@/lib/data';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const adminDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'admins', user.uid);
  }, [firestore, user]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isLoading = isUserLoading || isAdminLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login?redirect=/admin');
      } else if (!adminDoc) {
        // Logged in, but not an admin, redirect to user dashboard
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, adminDoc, router]);

  if (isLoading || !adminDoc) {
    return (
       <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
             <Skeleton className="h-8 w-24" />
             <div className="relative ml-auto flex-1 md:grow-0">
                <Skeleton className="h-8 w-full" />
             </div>
             <Skeleton className="h-8 w-8 rounded-full" />
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Skeleton className="h-[calc(100vh-5rem)] w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      navItems={adminNavItems}
      userName={user?.displayName || 'Admin'}
      userEmail={user?.email || 'admin@talktube.com'}
    >
      {children}
    </AppShell>
  );
}
