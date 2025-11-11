
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Logo } from '@/components/logo';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { setDoc, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { languages } from '@/lib/data';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('');
  const [userLanguages, setUserLanguages] = useState('');
  const [isInterpreter, setIsInterpreter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push(redirectUrl);
    }
  }, [isUserLoading, user, router, redirectUrl]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: fullName });

      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        id: firebaseUser.uid,
        name: fullName,
        email: firebaseUser.email,
        preferredLanguage: language,
        lastLogin: new Date().toISOString().split('T')[0]
      });

      // Special case: create admin user
      if (firebaseUser.email === 'admin@talktube.com') {
        const adminDocRef = doc(firestore, 'admins', firebaseUser.uid);
        await setDoc(adminDocRef, {
          name: fullName,
          email: firebaseUser.email,
          role: 'Admin',
        });
      }

      if (isInterpreter) {
        const interpreterDocRef = doc(firestore, 'interpreters', firebaseUser.uid);
        await setDoc(interpreterDocRef, {
            id: firebaseUser.uid,
            name: fullName,
            email: firebaseUser.email,
            status: 'Pendente',
            languages: userLanguages.split(',').map(l => l.trim()).filter(Boolean),
        });
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: isInterpreter 
          ? 'Seu cadastro como intérprete será revisado.' 
          : 'Você está sendo redirecionado.',
      });
      router.push(redirectUrl);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description:
          error.code === 'auth/email-already-in-use'
            ? 'Este e-mail já está em uso.'
            : 'Ocorreu um erro. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      await setDoc(
        userDocRef,
        {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          preferredLanguage: language || 'Português',
          lastLogin: new Date().toISOString().split('T')[0]
        },
        { merge: true }
      ); 

      toast({
        title: 'Login com Google bem-sucedido!',
      });
      router.push(redirectUrl);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Login com Google',
        description: 'Não foi possível fazer login com o Google.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center text-foreground"
        >
          <Logo className="mr-2 h-8 w-8" />
          <span className="font-headline text-2xl font-bold">Talktube</span>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para criar sua conta no Talktube.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Nome Completo</Label>
                <Input
                  id="full-name"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma Preferido</Label>
                <Select
                  onValueChange={setLanguage}
                  value={language}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Selecione seu idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="flex items-start space-x-2">
                <Checkbox
                  id="is-interpreter"
                  checked={isInterpreter}
                  onCheckedChange={(checked) => setIsInterpreter(checked as boolean)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <div className='grid gap-1.5 leading-none'>
                  <Label
                    htmlFor="is-interpreter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Quero me cadastrar como intérprete
                  </Label>
                   <p className="text-sm text-muted-foreground">
                    Seu perfil ficará pendente de aprovação por um administrador.
                  </p>
                </div>
              </div>
              {isInterpreter && (
                <div className="space-y-2">
                    <Label htmlFor="user-languages">Idiomas em que você atua</Label>
                    <Input 
                      id="user-languages"
                      placeholder="Ex: Inglês, Espanhol, Francês"
                      value={userLanguages}
                      onChange={(e) => setUserLanguages(e.target.value)}
                      required={isInterpreter}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">Separe os idiomas por vírgula.</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou cadastre-se com
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
              <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="underline">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
