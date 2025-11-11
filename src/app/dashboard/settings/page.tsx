
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser } from 'firebase/auth';
import { languages } from '@/lib/data';
import { Loader2, Save, Upload, Trash2, KeyRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';


const profileSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  preferredLanguage: z.string(),
  email: z.string().email(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const interpreterProfileSchema = z.object({
  languages: z.preprocess((val) => (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val), z.array(z.string()).min(1, "Especifique ao menos um idioma.")),
  hourlyRate: z.coerce.number().optional(),
});

type InterpreterProfileFormValues = z.infer<typeof interpreterProfileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "A senha atual é necessária."),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres."),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Main Component
export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const [isInterpreter, setIsInterpreter] = React.useState(false);
  const firestore = useFirestore();

  React.useEffect(() => {
    if (user && firestore) {
      const checkInterpreter = async () => {
        const interpreterDoc = await getDoc(doc(firestore, 'interpreters', user.uid));
        setIsInterpreter(interpreterDoc.exists());
      };
      checkInterpreter();
    }
  }, [user, firestore]);

  if (isUserLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações de perfil e preferências da plataforma.
          </p>
        </div>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 flex flex-col gap-8'>
           <ProfileCard />
           {isInterpreter && <InterpreterProfileCard />}
        </div>
        <div className='lg:col-span-1'>
            <AccountActionsCard />
        </div>
      </div>
    </div>
  );
}


// Skeleton Loader
function SettingsSkeleton() {
    return (
        <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 flex flex-col gap-8'>
             <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent className='flex flex-col items-center gap-6'>
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className='w-full space-y-4'>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
                <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
            </Card>
          </div>
          <div className='lg:col-span-1'>
            <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent className='space-y-4'>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
}

// Profile Card Component
function ProfileCard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<ProfileFormValues>(userDocRef);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      preferredLanguage: '',
      email: '',
      bio: '',
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      reset(userProfile);
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !userDocRef) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
      return;
    }

    try {
      await updateDoc(userDocRef, {
        name: data.name,
        preferredLanguage: data.preferredLanguage,
        bio: data.bio || '',
      });

      if (auth.currentUser && auth.currentUser.displayName !== data.name) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }

      toast({
        title: 'Perfil Atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Atualizar',
        description: 'Não foi possível salvar suas informações. Tente novamente.',
      });
    }
  };

  const isLoading = isUserLoading || isProfileLoading;
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className='flex flex-col items-center gap-6'>
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className='w-full space-y-4'>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </CardContent>
            <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
        </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>
            Essas informações podem ser exibidas publicamente na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="flex flex-col items-center gap-4">
                 <Avatar className="w-24 h-24">
                    {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
                    <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" disabled>
                    <Upload className="mr-2 h-4 w-4" />
                    Alterar Foto (Em breve)
                </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input id="name" placeholder="Seu nome" {...field} />
                )}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input id="email" type="email" disabled {...field} />
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferredLanguage">Idioma Preferido</Label>
              <Controller
                name="preferredLanguage"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="preferredLanguage">
                      <SelectValue placeholder="Selecione seu idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.preferredLanguage && <p className="text-sm text-destructive">{errors.preferredLanguage.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Sobre mim</Label>
               <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <Textarea id="bio" placeholder="Fale um pouco sobre você..." {...field} />
                )}
              />
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isSubmitting || isLoading || !isDirty}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Interpreter Profile Card
function InterpreterProfileCard() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const interpreterDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'interpreters', user.uid);
    }, [firestore, user]);
    
    const { data: interpreterProfile, isLoading } = useDoc<any>(interpreterDocRef);

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors, isDirty },
    } = useForm<InterpreterProfileFormValues>({
        resolver: zodResolver(interpreterProfileSchema),
        defaultValues: {
            languages: [],
            hourlyRate: 0,
        },
    });

     React.useEffect(() => {
        if (interpreterProfile) {
            reset({
                ...interpreterProfile,
                languages: interpreterProfile.languages.join(', '),
            });
        }
    }, [interpreterProfile, reset]);

    const onSubmit = async (data: InterpreterProfileFormValues) => {
        if (!user || !interpreterDocRef) return;

        try {
            await setDoc(interpreterDocRef, data, { merge: true });
            toast({ title: 'Perfil de intérprete atualizado!' });
        } catch (error) {
            console.error('Error updating interpreter profile:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Atualizar',
                description: 'Não foi possível salvar seu perfil de intérprete.',
            });
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Perfil de Intérprete</CardTitle>
                    <CardDescription>Gerencie suas informações profissionais que são visíveis para outros usuários.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="languages">Idiomas em que atua</Label>
                        <Controller
                            name="languages"
                            control={control}
                            render={({ field }) => (
                                <Input id="languages" placeholder="Ex: Inglês, Espanhol" {...field} />
                            )}
                        />
                        <p className="text-sm text-muted-foreground">Separe os idiomas por vírgula.</p>
                        {errors.languages && <p className="text-sm text-destructive">{Array.isArray(errors.languages) ? errors.languages.join(', ') : errors.languages.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="hourlyRate">Sua taxa por hora (USD) - Opcional</Label>
                        <Controller
                            name="hourlyRate"
                            control={control}
                            render={({ field }) => (
                                <Input id="hourlyRate" type="number" placeholder="Ex: 50" {...field} />
                            )}
                        />
                         {errors.hourlyRate && <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>}
                    </div>
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Perfil Profissional
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

// Account Actions Card
function AccountActionsCard() {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword }, reset: resetPassword } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema)
    });

    const [currentPasswordForDelete, setCurrentPasswordForDelete] = React.useState('');

    const handleChangePassword = async (data: PasswordFormValues) => {
        if (!user || !user.email) return;

        const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
        
        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, data.newPassword);
            toast({ title: "Senha alterada com sucesso!" });
            resetPassword();
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Erro ao alterar senha",
                description: error.code === 'auth/wrong-password' ? "A senha atual está incorreta." : "Ocorreu um erro. Tente novamente."
            });
        }
    };
    
    const handleDeleteAccount = async () => {
        if (!user || !user.email) return;
        
        const credential = EmailAuthProvider.credential(user.email, currentPasswordForDelete);

        try {
            await reauthenticateWithCredential(user, credential);
            await deleteUser(user);
            toast({ title: "Conta excluída com sucesso." });
            router.push('/');
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Erro ao excluir conta",
                description: error.code === 'auth/wrong-password' ? "A senha atual está incorreta." : "Ocorreu um erro. Tente novamente."
            });
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Ações da Conta</CardTitle>
                <CardDescription>Gerencie a segurança e o estado da sua conta.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <form onSubmit={handleSubmitPassword(handleChangePassword)} className="grid gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="currentPassword">Senha Atual</Label>
                        <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
                        {errorsPassword.currentPassword && <p className="text-sm text-destructive">{errorsPassword.currentPassword.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
                        {errorsPassword.newPassword && <p className="text-sm text-destructive">{errorsPassword.newPassword.message}</p>}
                    </div>
                    <Button type="submit" variant="outline" disabled={isSubmittingPassword}>
                        {isSubmittingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                        Alterar Senha
                    </Button>
                </form>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className='w-full'>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Conta
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid gap-2">
                            <Label htmlFor="password-delete">Para confirmar, digite sua senha atual</Label>
                            <Input id="password-delete" type="password" value={currentPasswordForDelete} onChange={(e) => setCurrentPasswordForDelete(e.target.value)} />
                        </div>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} disabled={!currentPasswordForDelete}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </CardContent>
        </Card>
    );
}
