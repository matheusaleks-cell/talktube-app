import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

export default function AdminMeetingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Reuniões</h1>
          <p className="text-muted-foreground">
            Visualize e modere todas as reuniões da plataforma. (Em breve)
          </p>
        </div>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Em Construção</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
          <CalendarCheck className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Página de Gerenciamento de Reuniões em Desenvolvimento</h2>
          <p className="text-muted-foreground max-w-md">
            Logo os administradores poderão ver todas as reuniões ativas e agendadas, entrar em salas para moderação, gerenciar gravações e ver logs detalhados de cada sessão.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
