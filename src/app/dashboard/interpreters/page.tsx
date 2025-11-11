
'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Languages, UserCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Interpreter {
  id: string;
  name: string;
  email: string;
  languages: string[];
  hourlyRate?: number;
  status: 'Aprovado';
}

export default function InterpretersPage() {
  const firestore = useFirestore();

  const interpretersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'interpreters'),
      where('status', '==', 'Aprovado')
    );
  }, [firestore]);

  const { data: interpreters, isLoading } = useCollection<Interpreter>(interpretersQuery);

  const interpreterAvatar = PlaceHolderImages.find(p => p.id === 'interpreter-avatar');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Encontre um Intérprete</h1>
          <p className="text-muted-foreground">
            Explore nossa rede de intérpretes profissionais e qualificados.
          </p>
        </div>
      </div>
       {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
       ) : !interpreters || interpreters.length === 0 ? (
          <Card className="flex-1">
            <CardContent className="flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                <UserCheck className="w-16 h-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Nenhum Intérprete Disponível</h2>
                <p className="text-muted-foreground max-w-md">
                    No momento, não há intérpretes aprovados em nossa plataforma. Por favor, volte mais tarde.
                </p>
            </CardContent>
        </Card>
       ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {interpreters.map((interpreter) => (
            <Card key={interpreter.id} className="flex flex-col">
              <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={interpreterAvatar?.imageUrl} alt={interpreter.name} />
                  <AvatarFallback>{interpreter.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{interpreter.name}</CardTitle>
                <CardDescription>Intérprete Profissional</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-col items-center gap-4">
                    <div className='text-center'>
                        <p className="text-sm font-medium text-muted-foreground">Idiomas</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {interpreter.languages?.length > 0 ? (
                            interpreter.languages.map((lang) => (
                            <Badge key={lang} variant="secondary">
                                {lang}
                            </Badge>
                            ))
                        ) : (
                            <p className='text-sm text-muted-foreground'>Não especificado</p>
                        )}
                        </div>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Contratar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
    