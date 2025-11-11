import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios de uso e performance. (Em breve)
          </p>
        </div>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Em Construção</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
          <BarChart3 className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Página de Relatórios em Desenvolvimento</h2>
          <p className="text-muted-foreground max-w-md">
            Esta área permitirá a geração de relatórios detalhados sobre o uso da plataforma, incluindo minutos de reunião, idiomas mais requisitados, atividade de usuários e muito mais, com opções de exportação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
