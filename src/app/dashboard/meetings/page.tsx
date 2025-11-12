
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';

interface Meeting {
  id: string;
  title: string;
  startTime: Timestamp;
  duration: number;
  interpretationLanguages?: string[];
  participants?: number; // Making participants optional for scheduled meetings
}

export default function MeetingsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const meetingsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'meetings'),
      orderBy('startTime', 'desc')
    );
  }, [firestore, user]);

  const { data: meetings, isLoading } = useCollection<Meeting>(meetingsQuery);

  const now = new Date();
  const scheduledMeetings = React.useMemo(() => 
    meetings?.filter(m => m.startTime.toDate() >= now) || [], 
    [meetings]
  );
  const pastMeetings = React.useMemo(() => 
    meetings?.filter(m => m.startTime.toDate() < now) || [],
    [meetings]
  );

  const handleShare = (meetingId: string) => {
    const meetingUrl = `${window.location.origin}/sala/${meetingId}`;
    navigator.clipboard.writeText(meetingUrl);
    toast({
      title: 'Link da Reunião Copiado!',
      description: 'Você pode compartilhar este link com os participantes.',
    });
  };

  const renderTableBody = (meetingList: Meeting[], isScheduled: boolean) => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          </TableCell>
        </TableRow>
      );
    }

    if (!meetingList || meetingList.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            {isScheduled ? 'Nenhuma reunião agendada.' : 'Nenhuma reunião no histórico.'}
          </TableCell>
        </TableRow>
      );
    }

    return meetingList.map((meeting) => (
      <TableRow key={meeting.id}>
        <TableCell className="font-medium">{meeting.title}</TableCell>
        <TableCell>
          {meeting.startTime.toDate().toLocaleString('pt-BR', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </TableCell>
        <TableCell>{meeting.duration} min</TableCell>
        {isScheduled ? (
          <TableCell>
            <div className="flex gap-1">
              {meeting.interpretationLanguages?.map((lang) => (
                <Badge key={lang} variant="secondary">
                  {lang}
                </Badge>
              ))}
            </div>
          </TableCell>
        ) : (
          <TableCell>{meeting.participants || 0}</TableCell>
        )}
        <TableCell className="text-right space-x-2">
          {isScheduled ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare(meeting.id)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/sala/${meeting.id}`}>Entrar na sala</Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/recordings">Ver Gravação</Link>
            </Button>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Minhas Reuniões
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas reuniões agendadas e acesse seu histórico.
          </p>
        </div>
      </div>
      <Tabs defaultValue="scheduled">
        <TabsList>
          <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="scheduled">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data e Hora</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Idiomas de Interpretação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody(scheduledMeetings, true)}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="history">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody(pastMeetings, false)}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    