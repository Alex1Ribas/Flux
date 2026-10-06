import { useState } from 'react';
import type { TAuthMode } from '../model/validate-auth-form';
import { LoginScreen } from './login-screen';
import { RegisterScreen } from './register-screen';

export const AuthScreen = () => {
  const [mode, setMode] = useState<TAuthMode>('login');

  if (mode === 'cadastro') {
    return <RegisterScreen onGoToLogin={() => setMode('login')} />;
  }

  return <LoginScreen onGoToRegister={() => setMode('cadastro')} />;
};
