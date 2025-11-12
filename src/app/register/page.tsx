import { Suspense } from 'react';
import RegisterComponent from './RegisterComponent'; // O componente Cliente que contém a lógica

// Este é o novo componente Servidor para a rota /register.
// Sua única função é envolver o componente cliente com Suspense.
// Isso resolve o erro de 'useSearchParams' durante o build (prerenderização).
export default function RegisterPage() {
  return (
    // O fallback é exibido enquanto o Next.js resolve os hooks de navegação
    // (como useSearchParams) durante o carregamento inicial.
    <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div>Carregando tela de registro...</div> 
        </div>
    }>
      <RegisterComponent />
    </Suspense>
  );
}