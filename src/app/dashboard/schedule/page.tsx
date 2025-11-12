
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { languages, timezones } from '@/lib/data.tsx';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';

export default function ScheduleMeetingPage() {
  const [date, setDate] = React.useState<Date>();
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Você precisa estar logado para agendar uma reunião.',
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const time = formData.get('time') as string;
    const duration = formData.get('duration') as string;
    const timezone = formData.get('timezone') as string;
    const primaryLanguage = formData.get('primaryLanguage') as string;
    const interpretationLanguages = (formData.get('interpretationLanguages') as string)
      .split(',')
      .map(lang => lang.trim())
      .filter(Boolean);
    const interpreterType = 'Humano';

    if (!date || !time) {
      toast({
        variant: 'destructive',
        title: 'Data ou hora inválida',
        description: 'Por favor, selecione a data e a hora da reunião.',
      });
      setIsLoading(false);
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes);

    try {
      // First, create the meeting in the user's private collection
      const userMeetingsCollectionRef = collection(
        firestore,
        'users',
        user.uid,
        'meetings'
      );
      const userMeetingDoc = await addDoc(userMeetingsCollectionRef, {
        title,
        description,
        startTime,
        duration: Number(duration),
        timeZone: timezone,
        primaryLanguage,
        interpretationLanguages,
        interpreterType,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Then, create a corresponding public meeting document for WebRTC signaling
      // Use the SAME ID as the user's private meeting document for easy linking
      const publicMeetingDocRef = doc(firestore, 'meetings', userMeetingDoc.id);
      await setDoc(publicMeetingDocRef, {
          ownerId: user.uid,
          title: title,
          createdAt: serverTimestamp(),
          // Add any other public-facing info needed
      });


      toast({
        title: 'Reunião Agendada!',
        description: 'Sua reunião foi salva e está visível na sua agenda.',
      });
      router.push('/dashboard/meetings');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Agendar',
        description: 'Não foi possível salvar a reunião. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Agendar Nova Reunião</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para criar sua reunião multilíngue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="title">Título da Reunião</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Alinhamento Estratégico Q3"
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva os objetivos e a pauta da reunião."
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-3">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, 'PPP', { locale: ptBR })
                    ) : (
                      <span>Escolha uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={isLoading}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="time">Hora</Label>
              <Input id="time" name="time" type="time" defaultValue="10:00" required disabled={isLoading} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="duration">Duração</Label>
              <Select name="duration" defaultValue="60" disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select name="timezone" defaultValue="(GMT-03:00) Buenos Aires, Georgetown" disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
             <div className="grid gap-3">
              <Label htmlFor="main-language">Idioma Principal</Label>
              <Select name="primaryLanguage" defaultValue='Português' disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma principal" />
                </SelectTrigger>
                <SelectContent>
                   {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-3">
              <Label htmlFor="interpretation-languages">Idiomas de Interpretação (Opcional)</Label>
               <Input name="interpretationLanguages" id="interpretation-languages" placeholder="Ex: Inglês, Espanhol" disabled={isLoading} />
               <p className="text-xs text-muted-foreground">Separe os idiomas por vírgula.</p>
            </div>
          </div>
           <div className="grid gap-3">
            <Label>Tipo de Intérprete</Label>
             <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="interpreter-human" defaultChecked disabled />
                    <Label htmlFor="interpreter-human">Humano (Contratado na plataforma)</Label>
                </div>
            </div>
          </div>
           <div className="grid gap-3">
            <Label htmlFor="participants">Convidar Participantes (E-mails)</Label>
            <Textarea
              id="participants"
              name="participants"
              placeholder="convidado1@email.com, convidado2@email.com"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="add-to-calendar" defaultChecked disabled={isLoading} />
            <Label htmlFor="add-to-calendar">Adicionar ao Google Calendar / Outlook e enviar convites</Label>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Agendar e Enviar Lembretes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
