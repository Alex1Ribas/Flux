import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode.js';
import { Catalog } from './catalog.types.js';

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
  [EErrorCode.INVALID_PASSWORD]: {
    'pt-BR': 'Senha inválida.',
    en: 'Invalid password.',
    es: 'Contraseña inválida.',
  },
  [EErrorCode.INVALID_CREDENTIALS]: {
    'pt-BR': 'E-mail ou senha inválidos.',
    en: 'Invalid email or password.',
    es: 'Correo electrónico o contraseña inválidos.',
  },
  [EErrorCode.REGISTRATION_CLOSED]: {
    'pt-BR': 'Cadastro público encerrado. Contate o titular da conta.',
    en: 'Public registration is closed. Contact the account holder.',
    es: 'El registro público está cerrado. Contacte al titular de la cuenta.',
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
  [EErrorCode.NO_FIELDS_TO_UPDATE]: {
    'pt-BR': 'Nenhum campo para atualizar.',
    en: 'No fields to update.',
    es: 'No hay campos para actualizar.',
  },
  [EErrorCode.USER_NOT_IDENTIFIED]: {
    'pt-BR': 'Usuário não identificado.',
    en: 'User not identified.',
    es: 'Usuario no identificado.',
  },
  [EErrorCode.INVALID_TOKEN]: {
    'pt-BR': 'Token inválido ou expirado.',
    en: 'Invalid or expired token.',
    es: 'Token inválido o expirado.',
  },
  [EErrorCode.TOKEN_NOT_PROVIDED]: {
    'pt-BR': 'Token não fornecido.',
    en: 'Token not provided.',
    es: 'Token no proporcionado.',
  },
  [EErrorCode.ACCESS_DENIED]: {
    'pt-BR': 'Acesso negado.',
    en: 'Access denied.',
    es: 'Acceso denegado.',
  },
  [EErrorCode.INVALID_OBJECT_ID]: {
    'pt-BR': 'ID inválido.',
    en: 'Invalid ID.',
    es: 'ID inválido.',
  },
  [EErrorCode.CAIXA_NOT_FOUND]: {
    'pt-BR': 'Caixa não encontrada.',
    en: 'Box not found.',
    es: 'Caja no encontrada.',
  },
  [EErrorCode.CAIXA_ALREADY_EXISTS]: {
    'pt-BR': 'Já existe uma caixa com este nome.',
    en: 'A box with this name already exists.',
    es: 'Ya existe una caja con este nombre.',
  },
  [EErrorCode.CAIXA_NAME_REQUIRED]: {
    'pt-BR': 'Nome da caixa é obrigatório.',
    en: 'Box name is required.',
    es: 'El nombre de la caja es obligatorio.',
  },
  [EErrorCode.CAIXA_VALUE_INVALID]: {
    'pt-BR': 'Saldo da caixa deve ser numérico.',
    en: 'Box balance must be numeric.',
    es: 'El saldo de la caja debe ser numérico.',
  },
  [EErrorCode.LANCAMENTO_NOT_FOUND]: {
    'pt-BR': 'Lançamento não encontrado.',
    en: 'Entry not found.',
    es: 'Movimiento no encontrado.',
  },
  [EErrorCode.LANCAMENTO_VALUE_INVALID]: {
    'pt-BR': 'Valor do lançamento deve ser maior que zero.',
    en: 'Entry value must be greater than zero.',
    es: 'El valor del movimiento debe ser mayor que cero.',
  },
  [EErrorCode.LANCAMENTO_DISTRIBUICAO_REQUIRED]: {
    'pt-BR': 'Distribuição é obrigatória para entradas.',
    en: 'Distribution is required for incoming entries.',
    es: 'La distribución es obligatoria para entradas.',
  },
  [EErrorCode.LANCAMENTO_DISTRIBUICAO_INVALID]: {
    'pt-BR': 'Distribuição do lançamento inválida.',
    en: 'Invalid entry distribution.',
    es: 'Distribución del movimiento inválida.',
  },
  [EErrorCode.LANCAMENTO_CAIXA_ORIGEM_REQUIRED]: {
    'pt-BR': 'Caixa de origem é obrigatória para saídas.',
    en: 'Source box is required for outgoing entries.',
    es: 'La caja de origen es obligatoria para salidas.',
  },
  [EErrorCode.LANCAMENTO_COMPENSACAO_REQUIRED]: {
    'pt-BR': 'Caixa de compensação é obrigatória para estouro de orçamento.',
    en: 'Compensation box is required when budget is exceeded.',
    es: 'La caja de compensación es obligatoria al exceder el presupuesto.',
  },
  [EErrorCode.ORCAMENTO_VALUE_INVALID]: {
    'pt-BR': 'Valor do orçamento deve ser maior ou igual a zero.',
    en: 'Budget value must be greater than or equal to zero.',
    es: 'El valor del presupuesto debe ser mayor o igual que cero.',
  },
  [EErrorCode.COMPETENCIA_INVALID]: {
    'pt-BR': 'Competência deve estar no formato aaaa-mm.',
    en: 'Competence must be in yyyy-mm format.',
    es: 'La competencia debe estar en formato aaaa-mm.',
  },
  [EErrorCode.CAIXA_TIPO_INVALID]: {
    'pt-BR': 'Tipo de caixa inválido. Use objetivo ou orcamento.',
    en: 'Invalid box type. Use objetivo or orcamento.',
    es: 'Tipo de caja inválido. Use objetivo u orcamento.',
  },
  [EErrorCode.CAIXA_META_INVALID]: {
    'pt-BR': 'Meta da caixa de objetivo deve ser maior que zero.',
    en: 'Goal box target must be greater than zero.',
    es: 'La meta de la caja de objetivo debe ser mayor que cero.',
  },
  [EErrorCode.CAIXA_APORTE_INVALID]: {
    'pt-BR': 'Aporte mensal da caixa de objetivo deve ser maior que zero.',
    en: 'Monthly contribution must be greater than zero.',
    es: 'El aporte mensual debe ser mayor que cero.',
  },
  [EErrorCode.CAIXA_ORCAMENTO_INVALID]: {
    'pt-BR': 'Orçamento mensal da caixa deve ser maior que zero.',
    en: 'Monthly budget must be greater than zero.',
    es: 'El presupuesto mensual debe ser mayor que cero.',
  },
};
