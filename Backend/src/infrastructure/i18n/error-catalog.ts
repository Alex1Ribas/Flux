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
  [EErrorCode.CONTA_NOT_FOUND]: {
    'pt-BR': 'Conta não encontrada.',
    en: 'Account not found.',
    es: 'Cuenta no encontrada.',
  },
  [EErrorCode.CONTA_TIPO_INVALID]: {
    'pt-BR': 'Tipo de conta inválido. Use a_pagar ou a_receber.',
    en: 'Invalid account type. Use a_pagar or a_receber.',
    es: 'Tipo de cuenta inválido. Use a_pagar o a_receber.',
  },
  [EErrorCode.CONTA_DESCRICAO_REQUIRED]: {
    'pt-BR': 'Descrição da conta é obrigatória.',
    en: 'Account description is required.',
    es: 'La descripción de la cuenta es obligatoria.',
  },
  [EErrorCode.CONTA_VALUE_INVALID]: {
    'pt-BR': 'Valor da conta deve ser maior que zero.',
    en: 'Account value must be greater than zero.',
    es: 'El valor de la cuenta debe ser mayor que cero.',
  },
  [EErrorCode.CONTA_VENCIMENTO_INVALID]: {
    'pt-BR': 'Vencimento deve estar no formato aaaa-mm-dd.',
    en: 'Due date must be in yyyy-mm-dd format.',
    es: 'El vencimiento debe estar en formato aaaa-mm-dd.',
  },
  [EErrorCode.CONTA_CAIXA_REQUIRED]: {
    'pt-BR': 'Caixa da conta é obrigatória.',
    en: 'Account box is required.',
    es: 'La caja de la cuenta es obligatoria.',
  },
  [EErrorCode.CONTA_STATUS_INVALID]: {
    'pt-BR': 'Status de conta inválido para esta operação.',
    en: 'Invalid account status for this operation.',
    es: 'Estado de cuenta inválido para esta operación.',
  },
  [EErrorCode.CONTA_NAO_ABERTA]: {
    'pt-BR': 'Só é possível alterar ou liquidar contas abertas.',
    en: 'Only open accounts can be updated or settled.',
    es: 'Solo se pueden alterar o liquidar cuentas abiertas.',
  },
  [EErrorCode.CONTA_JA_LIQUIDADA]: {
    'pt-BR': 'Conta já liquidada não pode ser excluída.',
    en: 'A settled account cannot be deleted.',
    es: 'Una cuenta liquidada no puede eliminarse.',
  },
  [EErrorCode.CONTA_LIQUIDACAO_DATA_INVALID]: {
    'pt-BR': 'Data de liquidação deve estar no formato aaaa-mm-dd.',
    en: 'Settlement date must be in yyyy-mm-dd format.',
    es: 'La fecha de liquidación debe estar en formato aaaa-mm-dd.',
  },
  [EErrorCode.SIMULACAO_VALOR_TOTAL_INVALIDO]: {
    'pt-BR': 'Valor total da simulação deve ser maior que zero.',
    en: 'Simulation total amount must be greater than zero.',
    es: 'El valor total de la simulación debe ser mayor que cero.',
  },
  [EErrorCode.SIMULACAO_DURACAO_INVALIDA]: {
    'pt-BR': 'Duração da simulação deve ser de pelo menos 1 mês.',
    en: 'Simulation duration must be at least 1 month.',
    es: 'La duración de la simulación debe ser de al menos 1 mes.',
  },
  [EErrorCode.SIMULACAO_DATA_INVALIDA]: {
    'pt-BR': 'Data do primeiro pagamento é obrigatória.',
    en: 'First payment date is required.',
    es: 'La fecha del primer pago es obligatoria.',
  },
  [EErrorCode.SIMULACAO_PARCELA_INVALIDA]: {
    'pt-BR': 'Parcela mensal da simulação deve ser maior que zero.',
    en: 'Simulation monthly installment must be greater than zero.',
    es: 'La cuota mensual de la simulación debe ser mayor que cero.',
  },
  [EErrorCode.SIMULACAO_MODO_COMPENSACAO_INVALIDO]: {
    'pt-BR': 'Modo de compensação da simulação é inválido.',
    en: 'Simulation compensation mode is invalid.',
    es: 'El modo de compensación de la simulación es inválido.',
  },
  [EErrorCode.SIMULACAO_FONTES_OBRIGATORIAS]: {
    'pt-BR': 'Informe ao menos uma fonte de compensação no modo declarado.',
    en: 'Provide at least one compensation source in declared mode.',
    es: 'Informe al menos una fuente de compensación en modo declarado.',
  },
  [EErrorCode.SIMULACAO_FONTE_VALOR_INVALIDO]: {
    'pt-BR': 'Valor mensal destinado da fonte deve ser maior ou igual a zero.',
    en: 'Source monthly allocated value must be greater than or equal to zero.',
    es: 'El valor mensual asignado de la fuente debe ser mayor o igual a cero.',
  },
  [EErrorCode.SIMULACAO_FONTE_INEXISTENTE]: {
    'pt-BR': 'Fonte de compensação apontada não existe.',
    en: 'Selected compensation source does not exist.',
    es: 'La fuente de compensación seleccionada no existe.',
  },
  [EErrorCode.SIMULACAO_TOTAL_FONTES_DIVERGENTE]: {
    'pt-BR': 'A soma das fontes deve ser igual ao valor da parcela mensal.',
    en: 'Sources sum must equal the monthly installment value.',
    es: 'La suma de fuentes debe ser igual al valor de la cuota mensual.',
  },
};
