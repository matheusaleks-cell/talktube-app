'use client';

import { AppShell } from '@/components/dashboard/app-shell';
import { userNavItems } from '@/lib/data';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
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
      navItems={userNavItems}
      userName={user.displayName || 'Usuário'}
      userEmail={user.email || ''}
    >
      {children}
    </AppShell>
  );
}
