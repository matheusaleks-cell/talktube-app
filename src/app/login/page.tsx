import { Suspense } from 'react';
import LoginWrapper from './LoginWrapper'; // Importa a lógica do cliente que usa useSearchParams

// Este é o componente Servidor da rota /login.
// Ele envolve o componente cliente com Suspense para resolver o erro no build.
export default function LoginPage() {
  return (
    // <Suspense> permite que o Next.js lide com hooks assíncronos (como useSearchParams)
    // durante a prerenderização no Netlify.
    <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div>Carregando tela de login...</div> 
        </div>
    }>
      <LoginWrapper />
    </Suspense>
  );
}