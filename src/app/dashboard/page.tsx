
'use client';

import Link from 'next/link';
import {
  Calendar,
  Contact,
  Presentation,
  Archive,
  BarChart,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { chartData } from '@/lib/data.tsx';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const now = new Date();
    const dayAndWeek = format(now, 'd, EEEE', { locale: ptBR });
    const monthAndYear = format(now, "MMMM 'de' yyyy", { locale: ptBR });

    setCurrentDate(`${dayAndWeek.charAt(0).toUpperCase() + dayAndWeek.slice(1)}`);
    setGreeting(monthAndYear.charAt(0).toUpperCase() + monthAndYear.slice(1));
  }, []);

  const stats = [
    {
      title: 'CONFERÊNCIAS AGENDADAS',
      value: '0',
      change: '0 Conferências Agendadas Hoje',
      icon: <Calendar className="h-8 w-8 text-white" />,
      color: 'bg-blue-900',
    },
    {
      title: 'CONFERÊNCIAS PROMOVIDAS',
      value: '3',
      change: '0 Conferências Promovidas Hoje',
      icon: <Presentation className="h-8 w-8 text-white" />,
      color: 'bg-cyan-500',
    },
    {
      title: 'CONFERÊNCIAS PARTICIPADAS',
      value: '1',
      change: '0 Conferências Participadas Hoje',
      icon: <Contact className="h-8 w-8 text-white" />,
      color: 'bg-green-500',
    },
    {
      title: 'CONFERÊNCIAS',
      value: '3',
      change: '0 Conferências Hoje',
      icon: <Archive className="h-8 w-8 text-white" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/dashboard/schedule">
              <BarChart className="mr-2 h-4 w-4" />
              INICIAR CONFERÊNCIA
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.color}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-2">
                <span className="mr-1">↑</span>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            {isUserLoading ? (
               <Skeleton className="h-7 w-32" />
            ) : (
              <CardTitle className="text-lg font-semibold">
                Olá, {user?.displayName?.split(' ')[0] || 'Usuário'}!
              </CardTitle>
            )}
            <CardDescription className="text-lg">
              {currentDate}
            </CardDescription>
            <p className="text-sm text-muted-foreground">{greeting}</p>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Nada por enquanto!</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Métrica</CardTitle>
            <Button variant="ghost" size="icon">
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={chartData}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 4]}
                  ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar
                  dataKey="total"
                  name="Reuniões"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
