
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Configurações Gerais
        </h1>
        <p className="text-muted-foreground">
          Gerencie integrações e configurações globais da plataforma Talktube.
        </p>
      </div>

       <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Página em Construção</AlertTitle>
          <AlertDescription>
            A maioria das configurações de administrador será gerenciada diretamente pelo console do Firebase ou por meio de variáveis de ambiente por questões de segurança. Esta interface será usada para configurações globais seguras no futuro.
          </AlertDescription>
        </Alert>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Integrações de API</CardTitle>
              <CardDescription>
                Configure as chaves de API para serviços externos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="google-api">Chave de API do Google</Label>
                <Input
                  id="google-api"
                  placeholder="Definido via variável de ambiente"
                  disabled
                />
                 <p className="text-sm text-muted-foreground">
                    Necessário para Google Calendar e outras integrações Google.
                </p>
              </div>
               <div className="grid gap-3">
                <Label htmlFor="smtp-api">Chave de API do SMTP</Label>
                <Input
                  id="smtp-api"
                  placeholder="Definido via variável de ambiente"
                  disabled
                />
                 <p className="text-sm text-muted-foreground">
                    Usado para o envio de e-mails transacionais e lembretes.
                </p>
              </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
                <Button disabled>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Integrações
                </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recursos da Plataforma</CardTitle>
                    <CardDescription>Ative ou desative funcionalidades.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enable-recording" defaultChecked disabled/>
                        <Label htmlFor="enable-recording">Permitir gravação de reuniões</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="enable-public-signup" defaultChecked disabled/>
                        <Label htmlFor="enable-public-signup">Permitir cadastro público</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="enable-interpreter-approval" defaultChecked disabled/>
                        <Label htmlFor="enable-interpreter-approval">Exigir aprovação de intérprete</Label>
                    </div>
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Button disabled>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Recursos
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
