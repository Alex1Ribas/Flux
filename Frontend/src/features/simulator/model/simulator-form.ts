import { EDecisionMode } from '@/entities/decision/model/verdict';

export interface ISimulatorModeOption {
  mode: EDecisionMode;
  label: string;
}

export const SIMULATOR_MODES: ISimulatorModeOption[] = [
  { mode: EDecisionMode.HOJE, label: 'Hoje' },
  { mode: EDecisionMode.PARCELA, label: 'Parcela' },
  { mode: EDecisionMode.AVISTA, label: 'À vista (venc. cartão)' },
];

export interface ISimulatorFormState {
  day: string;
  available: string;
  expense: string;
  total: string;
  installments: string;
  value: string;
  cashAvailable: string;
  cashInstallments: string;
}

export const createDefaultSimulatorForm = (): ISimulatorFormState => ({
  day: String(new Date().getDate()),
  available: '',
  expense: '',
  total: '',
  installments: '1',
  value: '',
  cashAvailable: '',
  cashInstallments: '1',
});
