import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function AdminRemindersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Logs de Lembretes</h1>
          <p className="text-muted-foreground">
            Acompanhe o envio de notificações e lembretes. (Em breve)
          </p>
        </div>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Em Construção</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
          <Bell className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Página de Logs de Lembretes em Desenvolvimento</h2>
          <p className="text-muted-foreground max-w-md">
            Em breve, os administradores poderão visualizar um log completo de todos os lembretes enviados (e-mail, push, WhatsApp), verificar status de entrega e solucionar problemas de notificação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
