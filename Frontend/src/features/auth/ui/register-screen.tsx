import { useState } from 'react';
import { apiErrorMessage } from '@/shared/api/api-client';
import { useLogin } from '../api/use-login';
import { useRegister } from '../api/use-register';
import {
  MIN_PASSWORD_LENGTH,
  validateAuthForm,
  type IAuthFormState,
} from '../model/validate-auth-form';
import { AuthField } from './auth-field';
import { AuthLayout } from './auth-layout';

const EMPTY_FORM: IAuthFormState = { name: '', email: '', password: '', confPassword: '' };

interface IRegisterScreenProps {
  onGoToLogin: () => void;
}

export const RegisterScreen = ({ onGoToLogin }: IRegisterScreenProps) => {
  const [form, setForm] = useState<IAuthFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const register = useRegister();
  const login = useLogin();

  const updateField = (field: keyof IAuthFormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const submit = async () => {
    const validationError = validateAuthForm('cadastro', form);
    if (validationError) {
      setError(validationError);
      return;
    }
    const email = form.email.trim();
    try {
      await register.mutateAsync({ ...form, name: form.name.trim(), email });
      await login.mutateAsync({ email, password: form.password });
    } catch (submitError) {
      setError(apiErrorMessage(submitError, 'Não foi possível criar a conta. Tente novamente.'));
    }
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para montar o seu planejamento mês a mês."
      submitLabel="Criar conta"
      isSubmitting={register.isPending || login.isPending}
      error={error}
      onSubmit={() => {
        void submit();
      }}
      switchPrompt="Já tem conta?"
      switchLabel="Entrar"
      onSwitch={onGoToLogin}
    >
      <AuthField
        label="Nome"
        value={form.name}
        onChangeText={updateField('name')}
        placeholder="Seu nome"
        autoComplete="name"
      />
      <AuthField
        label="E-mail"
        value={form.email}
        onChangeText={updateField('email')}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoComplete="email"
      />
      <AuthField
        label="Senha"
        value={form.password}
        onChangeText={updateField('password')}
        placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
        secure
        autoComplete="new-password"
      />
      <AuthField
        label="Confirmar senha"
        value={form.confPassword}
        onChangeText={updateField('confPassword')}
        placeholder="Repita sua senha"
        secure
        autoComplete="new-password"
      />
    </AuthLayout>
  );
};
