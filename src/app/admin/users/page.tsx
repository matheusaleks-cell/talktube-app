
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  lastLogin: string | Timestamp;
}

interface Interpreter {
  id: string;
  name: string;
  email: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  languages: string[];
}

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const interpretersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'interpreters');
  }, [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
  const { data: interpreters, isLoading: isLoadingInterpreters } = useCollection<Interpreter>(interpretersQuery);

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
      case 'aprovado':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'rejeitado':
      case 'banido':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleUpdateStatus = async (interpreterId: string, newStatus: Interpreter['status']) => {
    if (!firestore) return;
    const interpreterDocRef = doc(firestore, 'interpreters', interpreterId);
    try {
      await updateDoc(interpreterDocRef, { status: newStatus });
      toast({
        title: 'Status do intérprete atualizado!',
        description: `O intérprete agora está ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status do intérprete.',
      });
      console.error(error);
    }
  };

  const formatLastLogin = (lastLogin: string | Timestamp | undefined) => {
    if (!lastLogin) return 'N/A';
    if (typeof lastLogin === 'string') {
      return new Date(lastLogin).toLocaleDateString('pt-BR');
    }
    if (lastLogin instanceof Timestamp) {
      return lastLogin.toDate().toLocaleDateString('pt-BR');
    }
    return 'Data inválida';
  }

  const isLoading = isLoadingUsers || isLoadingInterpreters;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os usuários e intérpretes da plataforma.
          </p>
        </div>
      </div>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="interpreters">Intérpretes</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Idioma Preferido</TableHead>
                <TableHead>Último Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.preferredLanguage}</TableCell>
                  <TableCell>{formatLastLogin(user.lastLogin)}</TableCell>
                </TableRow>
              ))}
              {!isLoading && users?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="interpreters">
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Idiomas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && interpreters?.map((interpreter) => (
                <TableRow key={interpreter.id}>
                  <TableCell className="font-medium">{interpreter.name}</TableCell>
                  <TableCell>{interpreter.email}</TableCell>
                  <TableCell>
                    <div className='flex gap-1 flex-wrap'>
                      {interpreter.languages?.map(lang => <Badge key={lang} variant="secondary">{lang}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(interpreter.status)}>
                      {interpreter.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        {interpreter.status === 'Pendente' && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(interpreter.id, 'Aprovado')}>
                            Aprovar Intérprete
                          </DropdownMenuItem>
                        )}
                        {interpreter.status === 'Aprovado' && (
                           <DropdownMenuItem onClick={() => handleUpdateStatus(interpreter.id, 'Pendente')}>
                            Marcar como Pendente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleUpdateStatus(interpreter.id, 'Rejeitado')} className="text-destructive">
                          Rejeitar Cadastro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && interpreters?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum intérprete encontrado.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    