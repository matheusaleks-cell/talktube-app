'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import Link from 'next/link';
import {
  Users,
  Globe,
  CalendarClock,
  MessageSquare,
  Mic,
  Languages,
  Video,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import * as React from 'react';

const features = [
  {
    icon: <Users className="h-8 w-8 text-accent" />,
    title: 'Crie reuniões multilíngues',
    description:
      'Conecte-se com equipes globais em seus próprios idiomas, quebrando barreiras de comunicação.',
  },
  {
    icon: <Globe className="h-8 w-8 text-accent" />,
    title: 'Tenha intérpretes humanos ou IA',
    description:
      'Escolha entre a precisão de intérpretes profissionais ou a agilidade da nossa IA avançada.',
  },
  {
    icon: <CalendarClock className="h-8 w-8 text-accent" />,
    title: 'Agende e receba lembretes automáticos',
    description:
      'Nunca mais perca uma reunião. Nosso sistema envia notificações para todos os participantes.',
  },
  {
    icon: <Languages className="h-8 w-8 text-accent" />,
    title: 'Tradução e legendas ao vivo',
    description:
      'Acompanhe a conversa com legendas em tempo real, traduzidas para o seu idioma de preferência.',
  },
];

const testimonials = [
  {
    name: 'Ana Silva',
    title: 'Gerente de Projetos, TechGlobal',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    text: 'O Talktube revolucionou nossas reuniões internacionais. A interpretação simultânea é impecável e fácil de usar.',
  },
  {
    name: 'Carlos Santos',
    title: 'CEO, Innovate Solutions',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    text: 'Finalmente uma plataforma que entende a necessidade de comunicação global. Os lembretes automáticos são um bônus incrível.',
  },
  {
    name: 'Juliana Costa',
    title: 'Diretora de Eventos, ConnectWorld',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    text: 'Usamos o Talktube para nossos congressos virtuais. A flexibilidade entre intérpretes humanos e IA é fantástica.',
  },
];

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image-1');

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Talktube</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
              {isClient && !isUserLoading && (
                user ? (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button onClick={() => signOut(auth)}>Sair</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login">Entrar</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Criar Conta</Link>
                    </Button>
                  </>
                )
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Reuniões sem fronteiras. Com intérpretes humanos e IA em
                    tempo real.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    O Talktube é a solução definitiva para comunicação global.
                    Agende reuniões, escolha seu canal de idioma e colabore sem
                    barreiras.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/register">Experimente o Talktube agora</Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  Recursos Principais
                </div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                  Comunicação Simplificada. Globalmente.
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nossa plataforma foi desenhada para ser intuitiva e poderosa,
                  oferecendo todas as ferramentas que você precisa para se
                  comunicar efetivamente com o mundo.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 pt-12">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-1">
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">
                O que nossos clientes dizem
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Empresas líderes confiam no Talktube para suas comunicações
                mais importantes.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={testimonial.avatar}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {testimonial.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo className="h-6 w-6" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Talktube. Todos os direitos reservados.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sobre
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Termos
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Política de Privacidade
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contato
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
