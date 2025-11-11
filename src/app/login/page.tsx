import { Suspense } from 'react';
import LoginComponent from './LoginComponent'; // Componente Cliente que usa useSearchParams

// Este é o componente Servidor da rota /login.
// Ele resolve o erro de 'missing-suspense' do Next.js.
export default function LoginPage() {
  return (
    // O fallback é exibido enquanto o Next.js resolve os hooks de navegação
    // (como useSearchParams) durante o carregamento inicial.
    <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
            {/* Mantemos o spinner de carregamento para uma boa UX */}
            <div>Carregando tela de login...</div> 
        </div>
    }>
      <LoginComponent />
    </Suspense>
  );
}