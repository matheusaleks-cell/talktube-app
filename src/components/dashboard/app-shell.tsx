
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  PanelLeft,
  Search,
  Settings,
  User,
  LogOut,
  LayoutDashboard,
  Maximize,
  Video,
  Users,
  CalendarCheck,
  Languages,
  Bell,
  BarChart3,
  Cog,
  Minimize,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Logo } from '@/components/logo';
import type { NavItem } from '@/lib/data.tsx';
import { cn } from '@/lib/utils';
import { useAuth, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

type AppShellProps = {
  navItems: NavItem[];
  userName: string;
  userEmail: string;
  children: React.ReactNode;
};

export function AppShell({
  navItems,
  userName,
  userEmail,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'admins', user.uid);
  }, [firestore, user]);

  const { data: adminDoc } = useDoc(adminDocRef);
  const isUserAdmin = !!adminDoc;

  React.useEffect(() => {
    setIsClient(true);
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const navIconMap = {
    '/dashboard': <Home className="h-5 w-5" />,
    '/dashboard/meetings': <CalendarCheck className="h-5 w-5" />,
    '/dashboard/recordings': <Video className="h-5 w-5" />,
    '/dashboard/interpreters': <Languages className="h-5 w-5" />,
    '/dashboard/settings': <Settings className="h-5 w-5" />,
    '/admin': <LayoutDashboard className="h-5 w-5" />,
    '/admin/users': <Users className="h-5 w-5" />,
    '/admin/meetings': <CalendarCheck className="h-5 w-5" />,
    '/admin/interpreters': <Languages className="h-5 w-5" />,
    '/admin/reminders': <Bell className="h-5 w-5" />,
    '/admin/reports': <BarChart3 className="h-5 w-5" />,
    '/admin/settings': <Cog className="h-5 w-5" />,
  };
  
  const getIconForItem = (href: string) => {
    return navIconMap[href as keyof typeof navIconMap] || <div className="h-5 w-5" />;
  }

  return (
     <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background sm:flex transition-[width] duration-300",
        isSidebarCollapsed ? "w-14" : "w-56"
      )}>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
           <Link
            href="/"
            className={cn(
                "group flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:text-base",
                 isSidebarCollapsed ? "w-9" : "w-auto px-4"
            )}
          >
            <Logo className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className={cn("sr-only", !isSidebarCollapsed && "not-sr-only whitespace-nowrap")}>Talktube</span>
          </Link>
          {isClient && (
            <TooltipProvider delayDuration={isSidebarCollapsed ? 0 : 1000}>
                <div className='flex flex-col gap-2 w-full'>
              {navItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        isSidebarCollapsed ? 'h-9 w-9 justify-center' : 'justify-start',
                        pathname.startsWith(item.href) && item.href !== '/dashboard' && !pathname.startsWith('/dashboard/') && 'bg-accent text-accent-foreground hover:text-accent-foreground',
                        pathname === item.href ? 'bg-accent text-accent-foreground hover:text-accent-foreground' : ''
                      )}
                    >
                      {getIconForItem(item.href)}
                      <span className={cn("sr-only", !isSidebarCollapsed && "not-sr-only")}>{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ))}
              </div>
            </TooltipProvider>
          )}
        </nav>
      </aside>
      <div className={cn(
          "flex flex-col gap-4 py-4 transition-[padding] duration-300",
          isSidebarCollapsed ? "sm:pl-20" : "sm:pl-64"
        )}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Talktube</span>
                </Link>
                {isClient && navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn('flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                      pathname === item.href && 'text-foreground'
                    )}
                  >
                    {React.cloneElement(getIconForItem(item.href) as React.ReactElement, { className: "h-5 w-5" })}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="hidden sm:flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                <PanelLeft className="h-5 w-5" />
                <span className='sr-only'>Toggle Sidebar</span>
             </Button>
             <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                <span className='sr-only'>Toggle Fullscreen</span>
             </Button>
          </div>

          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="O que você está buscando..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <span className="font-bold">{userName.substring(0,2).toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userName}</span>
                  <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center w-full">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              {isUserAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    Painel Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={pathname.startsWith('/admin') ? '/admin/settings' : '/dashboard/settings'} className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
