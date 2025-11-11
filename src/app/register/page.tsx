import { Suspense } from 'react';
import RegisterComponent from './RegisterComponent'; // O componente Cliente que vamos criar

// Este é o novo componente Servidor para a rota /register.
// Ele envolve o componente Cliente para resolver o erro de 'missing-suspense'.
export default function RegisterPage() {
  return (
    // O fallback é exibido enquanto os hooks de navegação são resolvidos
    <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div>Carregando tela de registro...</div> 
        </div>
    }>
      <RegisterComponent />
    </Suspense>
  );
}