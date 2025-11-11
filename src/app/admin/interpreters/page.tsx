import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from "lucide-react";

export default function AdminInterpretersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Intérpretes</h1>
          <p className="text-muted-foreground">
            Aprove, gerencie e avalie intérpretes. (Em breve)
          </p>
        </div>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Em Construção</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
          <Languages className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Página de Gerenciamento de Intérpretes em Desenvolvimento</h2>
          <p className="text-muted-foreground max-w-md">
            Esta seção permitirá que os administradores aprovem novos cadastros de intérpretes, definam suas línguas de atuação, visualizem suas avaliações e gerenciem seus status na plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
