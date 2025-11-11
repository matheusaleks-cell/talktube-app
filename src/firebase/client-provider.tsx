'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider, useFirebase } from '@firebase/provider';
import { InitializeFirebase } from '@firebase/init'; // Importação que você usa
import { useEffect } from 'react'; // <--- NOVA IMPORTAÇÃO NECESSÁRIA

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {

  // O BLOCO useMemo FOI SUBSTITUÍDO POR useEffect
  // O useEffect roda SOMENTE no lado do cliente (navegador),
  // evitando o erro 'auth/invalid-api-key' durante a build no servidor do Netlify.
  useEffect(() => {
    InitializeFirebase();
  }, []); // Array vazio garante que rode apenas uma vez.

  return (
    <FirebaseProvider
      firebaseApp={FirebaseServices.FirebaseApp}
      auth={FirebaseServices.auth}
      firestore={FirebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

// Certifique-se de que a função InitializeFirebase() no seu arquivo de init.ts/js
// está exposta para ser chamada aqui.