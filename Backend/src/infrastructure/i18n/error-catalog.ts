import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode.js';
import type { Catalog } from './catalog.types.js';

export const ErrorCatalog: Catalog<EErrorCode> = {
  [EErrorCode.INTERNAL_ERROR]: {
    'pt-BR': 'Erro interno do servidor.',
    en: 'Internal server error.',
    es: 'Error interno del servidor.',
  },
  [EErrorCode.VALIDATION_ERROR]: {
    'pt-BR': 'Dados inválidos.',
    en: 'Invalid data.',
    es: 'Datos inválidos.',
  },
  [EErrorCode.INVALID_OBJECT_ID]: {
    'pt-BR': 'ID inválido.',
    en: 'Invalid ID.',
    es: 'ID inválido.',
  },
  [EErrorCode.ROUTE_NOT_FOUND]: {
    'pt-BR': 'Rota não encontrada.',
    en: 'Route not found.',
    es: 'Ruta no encontrada.',
  },
  [EErrorCode.INCOME_SOURCE_NOT_FOUND]: {
    'pt-BR': 'Fonte de renda não encontrada.',
    en: 'Income source not found.',
    es: 'Fuente de ingresos no encontrada.',
  },
  [EErrorCode.EXPENSE_NOT_FOUND]: {
    'pt-BR': 'Conta não encontrada.',
    en: 'Expense not found.',
    es: 'Cuenta no encontrada.',
  },
  [EErrorCode.EXPENSE_MONTH_OUT_OF_RANGE]: {
    'pt-BR': 'Este mês está fora do período da conta.',
    en: 'This month is outside the expense period.',
    es: 'Este mes está fuera del período de la cuenta.',
  },
  [EErrorCode.USER_NOT_FOUND]: {
    'pt-BR': 'Usuário não encontrado.',
    en: 'User not found.',
    es: 'Usuario no encontrado.',
  },
  [EErrorCode.EMAIL_ALREADY_EXISTS]: {
    'pt-BR': 'E-mail já cadastrado.',
    en: 'Email already registered.',
    es: 'Correo electrónico ya registrado.',
  },
  [EErrorCode.INVALID_EMAIL]: {
    'pt-BR': 'E-mail inválido.',
    en: 'Invalid email.',
    es: 'Correo electrónico inválido.',
  },
  [EErrorCode.INVALID_CREDENTIALS]: {
    'pt-BR': 'E-mail ou senha inválidos.',
    en: 'Invalid email or password.',
    es: 'Correo electrónico o contraseña inválidos.',
  },
  [EErrorCode.PASSWORD_MISMATCH]: {
    'pt-BR': 'As senhas não coincidem.',
    en: 'Passwords do not match.',
    es: 'Las contraseñas no coinciden.',
  },
  [EErrorCode.PASSWORD_TOO_SHORT]: {
    'pt-BR': 'A senha deve ter pelo menos 8 caracteres.',
    en: 'Password must be at least 8 characters long.',
    es: 'La contraseña debe tener al menos 8 caracteres.',
  },
  [EErrorCode.NAME_REQUIRED]: {
    'pt-BR': 'Nome é obrigatório.',
    en: 'Name is required.',
    es: 'El nombre es obligatorio.',
  },
  [EErrorCode.EMAIL_REQUIRED]: {
    'pt-BR': 'E-mail é obrigatório.',
    en: 'Email is required.',
    es: 'El correo electrónico es obligatorio.',
  },
  [EErrorCode.PASSWORD_REQUIRED]: {
    'pt-BR': 'Senha é obrigatória.',
    en: 'Password is required.',
    es: 'La contraseña es obligatoria.',
  },
  [EErrorCode.CONF_PASSWORD_REQUIRED]: {
    'pt-BR': 'Confirmação de senha é obrigatória.',
    en: 'Password confirmation is required.',
    es: 'La confirmación de contraseña es obligatoria.',
  },
  [EErrorCode.INVALID_TOKEN]: {
    'pt-BR': 'Sessão inválida ou expirada. Entre novamente.',
    en: 'Invalid or expired session. Please sign in again.',
    es: 'Sesión inválida o expirada. Inicie sesión nuevamente.',
  },
  [EErrorCode.TOKEN_NOT_PROVIDED]: {
    'pt-BR': 'Entre para continuar.',
    en: 'Sign in to continue.',
    es: 'Inicie sesión para continuar.',
  },
};
