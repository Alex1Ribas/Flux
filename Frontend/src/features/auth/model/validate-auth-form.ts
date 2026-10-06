export type TAuthMode = 'login' | 'cadastro';

export interface IAuthFormState {
  name: string;
  email: string;
  password: string;
  confPassword: string;
}

export const MIN_PASSWORD_LENGTH = 8;

export const validateAuthForm = (mode: TAuthMode, form: IAuthFormState): string | null => {
  if (!form.email.trim() || !form.password) {
    return 'Informe e-mail e senha.';
  }
  if (mode === 'login') {
    return null;
  }
  if (!form.name.trim()) {
    return 'Informe seu nome.';
  }
  if (form.password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (form.password !== form.confPassword) {
    return 'As senhas não coincidem.';
  }
  return null;
};
