
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  CalendarPlus,
  Users,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  BarChart,
  Video,
  Languages,
  Rocket,
  Globe,
  Play,
  Heart,
  Linkedin,
  Twitter,
  Instagram,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image-1');

const howItWorks = [
  {
    icon: <CalendarPlus className="h-10 w-10 text-accent" />,
    title: '1. Agende sua reunião',
    description:
      'Escolha a data, hora e os idiomas necessários para a sua conferência.',
  },
  {
    icon: <Users className="h-10 w-10 text-accent" />,
    title: '2. Conecte com um intérprete',
    description:
      'Um profissional da nossa rede de intérpretes qualificados entra na chamada.',
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-accent" />,
    title: '3. Comunique-se sem barreiras',
    description:
      'Fale no seu idioma e ouça a interpretação em tempo real, como se todos falassem a mesma língua.',
  },
];

const features = [
  {
    icon: <Users className="h-6 w-6 text-accent" />,
    title: 'Intérpretes Humanos em Tempo Real',
    description:
      'Nossa plataforma conecta você a intérpretes profissionais para garantir uma comunicação precisa e com nuances culturais.',
  },
  {
    icon: <Globe className="h-6 w-6 text-accent" />,
    title: 'Suporte a +40 Idiomas',
    description:
      'Oferecemos uma vasta gama de idiomas para cobrir todas as suas necessidades de comunicação global.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-accent" />,
    title: 'Segurança Corporativa',
    description:
      'Todas as reuniões são protegidas com criptografia de ponta a ponta, garantindo a confidencialidade das suas conversas.',
  },
  {
    icon: <Video className="h-6 w-6 text-accent" />,
    title: 'Integração com Suas Ferramentas',
    description:
      'O Talktube funciona perfeitamente com Zoom, Google Meet e Microsoft Teams para uma experiência fluida.',
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
    name: 'John Smith',
    title: 'CEO, Innovate Solutions',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    text: 'Finalmente uma plataforma que entende a necessidade da comunicação global. A qualidade dos intérpretes é excepcional.',
  },
  {
    name: 'Yuki Tanaka',
    title: 'Diretora de Eventos, ConnectWorld',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    text: 'Usamos o Talktube para nossos congressos virtuais. Encontrar intérpretes qualificados na própria plataforma é fantástico.',
  },
];

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground dark:bg-primary dark:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 dark:bg-primary/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-8 w-8 text-white" />
            <span className="font-bold text-lg">Talktube</span>
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="#features">Recursos</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#how-it-works">Como Funciona</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#testimonials">Clientes</Link>
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
            {isClient &&
              (!isUserLoading && user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button onClick={() => signOut(auth)}>Sair</Button>
                </>
              ) : !isUserLoading ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button className="bg-accent hover:bg-accent/90 text-primary-foreground" asChild>
                    <Link href="/register">Criar Conta</Link>
                  </Button>
                </>
              ) : (
                <div className="w-40 h-10" />
              ))}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 lg:py-40 text-center text-primary-foreground overflow-hidden">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              data-ai-hint={heroImage.imageHint}
              fill
              className="object-cover z-0"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/60 z-10"></div>
          <div className="container relative z-20">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter max-w-4xl mx-auto">
              Comunicação global. Intérpretes humanos. Reuniões sem barreiras.
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
              O Talktube conecta pessoas e empresas do mundo todo com intérpretes humanos em tempo real — para que você possa se comunicar de verdade, em qualquer idioma.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold" asChild>
                <Link href="/register">
                    <Rocket className="mr-2 h-5 w-5" />
                    Experimente o Talktube agora
                </Link>
              </Button>
              <Button size="lg" variant="outline" className='bg-transparent hover:bg-primary-foreground/10 border-primary-foreground text-primary-foreground' asChild>
                <Link href="#how-it-works">
                    <Play className="mr-2 h-5 w-5" />
                    Assista à demonstração
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-background dark:bg-primary">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-sm uppercase font-semibold text-accent tracking-wider">
                Como funciona
              </h2>
              <p className="mt-2 font-headline text-3xl md:text-4xl font-bold tracking-tight">
                Comunicação global em 3 passos simples
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {howItWorks.map((step) => (
                <div key={step.title} className="text-center p-8 border border-border rounded-lg bg-card dark:bg-card/5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-accent/10 mx-auto">
                    {step.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-muted/20 dark:bg-primary/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-sm uppercase font-semibold text-accent tracking-wider">
                Recursos
              </h2>
              <p className="mt-2 font-headline text-3xl md:text-4xl font-bold tracking-tight">
                Ferramentas para uma comunicação sem falhas
              </p>
               <p className="mt-4 text-lg text-muted-foreground">
                Nossa plataforma foi projetada para ser poderosa, mas intuitiva,
                garantindo que suas reuniões globais sejam produtivas e
                eficientes.
              </p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 p-6 rounded-lg bg-card dark:bg-card/10"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-accent/10">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-28 bg-background dark:bg-primary">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-sm uppercase font-semibold text-accent tracking-wider">
                Prova Social
              </h2>
              <p className="mt-2 font-headline text-3xl md:text-4xl font-bold tracking-tight">
                Empresas no mundo todo confiam no Talktube
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Mais de 1.000 reuniões globais realizadas por mês com 98% de
                satisfação.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="bg-card dark:bg-card/5 border border-border/50">
                  <CardContent className="p-6">
                    <p className="italic text-muted-foreground">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-4 mt-6">
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
                        <p className="text-sm text-muted-foreground">
                          {testimonial.title}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="cta"
          className="py-20 md:py-28 bg-accent/10 dark:bg-accent/5"
        >
          <div className="container text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
              Pronto para se comunicar sem fronteiras?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Experimente o Talktube gratuitamente e veja como é fácil transformar reuniões em conexões reais.
            </p>
            <div className="mt-8 flex justify-center gap-4">
               <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold" asChild>
                <Link href="/register">
                  <Rocket className="mr-2 h-5 w-5" />
                  Começar agora
                </Link>
              </Button>
               <Button size="lg" variant="outline" asChild>
                <Link href="#">
                  Fale com nosso time
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-primary text-primary-foreground">
        <div className="container py-12">
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                <div className='md:col-span-1'>
                     <Link href="/" className="flex items-center space-x-2">
                        <Logo className="h-8 w-8 text-white" />
                        <span className="font-bold text-lg">Talktube</span>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-4">
                        Feito com <Heart className="inline h-4 w-4" /> pela Talktube.
                    </p>
                </div>
                <div className='md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8'>
                    <div>
                        <h4 className='font-semibold mb-4'>Produto</h4>
                        <nav className='flex flex-col gap-2'>
                           <Link href="#" className="text-sm text-muted-foreground hover:text-primary-foreground">Recursos</Link>
                           <Link href="#" className="text-sm text-muted-foreground hover:text-primary-foreground">Preços</Link>
                           <Link href="#" className="text-sm text-muted-foreground hover:text-primary-foreground">Blog</Link>
                        </nav>
                    </div>
                     <div>
                        <h4 className='font-semibold mb-4'>Empresa</h4>
                        <nav className='flex flex-col gap-2'>
                           <Link href="#" className="text-sm text-muted-foreground hover:text-primary-foreground">Sobre nós</Link>
                           <Link href="#" className="text-sm text-muted-foreground hover:text-primary-foreground">Carreiras</Link>
                           <Link href="#" className="text-sm text-muted-foreground hover:text-primary-foreground">Contato</Link>
                        </nav>
                    </div>
                     <div>
                        <h4 className='font-semibold mb-4'>Legal</h4>
                        <nav className='flex flex-col gap-2'>
                           <Link href="#" className="text-sm text-muted-foreground hover:text-primary-foreground">Termos de Serviço</Link>
                           <Link href="#" className="text-sm text-muted-foreground hover:text-primary-foreground">Privacidade</Link>
                        </nav>
                    </div>
                     <div>
                        <h4 className='font-semibold mb-4'>Social</h4>
                        <div className="flex gap-4">
                            <Link href="#"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary-foreground" /></Link>
                            <Link href="#"><Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary-foreground" /></Link>
                            <Link href="#"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary-foreground" /></Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-muted-foreground">
                 © {new Date().getFullYear()} Talktube. Todos os direitos reservados.
            </div>
        </div>
      </footer>
    </div>
  );
}
