'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Calendar, Languages, Clock } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { chartData, languageUsageData } from '@/lib/data.tsx';

const stats = [
  {
    title: 'Usuários Ativos',
    value: '1,254',
    change: '+12.5%',
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Reuniões Hoje',
    value: '82',
    change: '+5.1%',
    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Idiomas Utilizados',
    value: '12',
    change: 'Francês é o 3º mais popular',
    icon: <Languages className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Tempo Médio de Reunião',
    value: '48 min',
    change: '-2 min vs. mês passado',
    icon: <Clock className="h-4 w-4 text-muted-foreground" />,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Painel do Administrador
          </h1>
          <p className="text-muted-foreground">
            Visão geral e estatísticas da plataforma Talktube.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral de Reuniões</CardTitle>
            <CardDescription>Volume de reuniões realizadas por mês.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
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
                  tickFormatter={(value) => `${value}`}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Idiomas Mais Usados</CardTitle>
            <CardDescription>Distribuição dos idiomas nas reuniões.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={languageUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {languageUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
