import Link from 'next/link';
import { PlusCircle, Calendar, Video, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está um resumo da sua atividade.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/schedule">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agendar Nova Reunião
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reuniões Agendadas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Próximas reuniões na sua agenda.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/meetings">Ver todas</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gravações</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Gravações disponíveis para assistir.
            </p>
             <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/recordings">Acessar gravações</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transcrições e Resumos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Documentos gerados por IA.
            </p>
             <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/recordings">Ver documentos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Início Rápido</CardTitle>
            <CardDescription>Comece a usar o Talktube agora mesmo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/schedule" className="block p-4 border rounded-lg hover:bg-muted">
                <h3 className="font-semibold">Agendar Reunião</h3>
                <p className="text-sm text-muted-foreground">Crie um novo evento multilíngue.</p>
            </Link>
             <Link href="/dashboard/meetings" className="block p-4 border rounded-lg hover:bg-muted">
                <h3 className="font-semibold">Ver Agenda</h3>
                <p className="text-sm text-muted-foreground">Consulte suas próximas reuniões.</p>
            </Link>
             <Link href="/dashboard/interpreters" className="block p-4 border rounded-lg hover:bg-muted">
                <h3 className="font-semibold">Buscar Intérpretes</h3>
                <p className="text-sm text-muted-foreground">Encontre profissionais para seus eventos.</p>
            </Link>
             <Link href="/dashboard/settings" className="block p-4 border rounded-lg hover:bg-muted">
                <h3 className="font-semibold">Ajustar Perfil</h3>
                <p className="text-sm text-muted-foreground">Atualize suas configurações.</p>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
