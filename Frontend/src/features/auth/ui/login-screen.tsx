import { useState } from 'react';
import { apiErrorMessage } from '@/shared/api/api-client';
import { useLogin } from '../api/use-login';
import { validateAuthForm } from '../model/validate-auth-form';
import { AuthField } from './auth-field';
import { AuthLayout } from './auth-layout';

interface ILoginScreenProps {
  onGoToRegister: () => void;
}

export const LoginScreen = ({ onGoToRegister }: ILoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();

  const submit = async () => {
    const validationError = validateAuthForm('login', { name: '', email, password, confPassword: '' });
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await login.mutateAsync({ email: email.trim(), password });
    } catch (submitError) {
      setError(apiErrorMessage(submitError, 'Não foi possível entrar. Tente novamente.'));
    }
  };

  return (
    <AuthLayout
      title="Entrar no Flux"
      subtitle="Use seu e-mail e senha para ver o seu planejamento."
      submitLabel="Entrar"
      isSubmitting={login.isPending}
      error={error}
      onSubmit={() => {
        void submit();
      }}
      switchPrompt="Ainda não tem conta?"
      switchLabel="Criar conta"
      onSwitch={onGoToRegister}
    >
      <AuthField
        label="E-mail"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setError(null);
        }}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoComplete="email"
      />
      <AuthField
        label="Senha"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setError(null);
        }}
        placeholder="Sua senha"
        secure
        autoComplete="password"
      />
    </AuthLayout>
  );
};
