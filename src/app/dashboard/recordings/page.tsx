
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
import { Button } from '@/components/ui/button';
import { Download, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data, to be replaced with Firestore data
const recordings = [
  {
    id: 'rec-001',
    title: 'Alinhamento Estratégico Q3',
    date: '2024-07-20',
    duration: '60 min',
    videoUrl: '#',
    downloadUrl: '#',
    transcriptAvailable: true,
  },
  {
    id: 'rec-002',
    title: 'Review de Design do App',
    date: '2024-07-18',
    duration: '45 min',
    videoUrl: '#',
    downloadUrl: '#',
    transcriptAvailable: true,
  },
  {
    id: 'rec-003',
    title: 'Reunião com Parceiros Internacionais',
    date: '2024-07-15',
    duration: '90 min',
    videoUrl: '#',
    downloadUrl: '#',
    transcriptAvailable: false,
  },
];


export default function RecordingsPage() {
    const { toast } = useToast();

    const handleAction = (message: string) => {
        toast({
            title: 'Funcionalidade em desenvolvimento',
            description: message,
        });
    };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Gravações e Transcrições
          </h1>
          <p className="text-muted-foreground">
            Acesse o histórico de gravações de suas reuniões.
          </p>
        </div>
      </div>
      <div className="border rounded-lg w-full">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Título da Reunião</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recordings.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Nenhuma gravação encontrada.
                        </TableCell>
                    </TableRow>
                ) : (
                    recordings.map(rec => (
                        <TableRow key={rec.id}>
                            <TableCell className="font-medium">{rec.title}</TableCell>
                            <TableCell>{new Date(rec.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                            <TableCell>{rec.duration}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleAction('A visualização de gravações será implementada em breve.')}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Assistir
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleAction('O download de gravações será implementado em breve.')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Baixar
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    disabled={!rec.transcriptAvailable}
                                    onClick={() => handleAction('A visualização de transcrições será implementada em breve.')}
                                >
                                    Ver Transcrição
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
