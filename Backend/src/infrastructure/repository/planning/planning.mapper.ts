import type {
  IExpense,
  IIncomeSource,
  IPlanningSettings,
} from '../../../domain/planning/entity/interfaces/planning.interface.js';
import type { IMExpense } from '../../db/mongo/models/expense.model.js';
import type { IMIncomeSource } from '../../db/mongo/models/income-source.model.js';
import type { IMPlanningSettings } from '../../db/mongo/models/planning-settings.model.js';

export function toIPlanningSettings(document: IMPlanningSettings): IPlanningSettings {
  return {
    id: document._id.toString(),
    reserveRate: Number(document.reserveRate) || 0,
    initialReserve: Number(document.initialReserve) || 0,
  };
}

export function toIIncomeSource(document: IMIncomeSource): IIncomeSource {
  return {
    id: document._id.toString(),
    name: document.name,
    payDay: document.payDay,
    amount: Number(document.amount) || 0,
    month: document.month ?? null,
  };
}

export function toIExpense(document: IMExpense): IExpense {
  return {
    id: document._id.toString(),
    name: document.name,
    dueDay: document.dueDay ?? null,
    dueNote: document.dueNote ?? '',
    defaultAmount: Number(document.defaultAmount) || 0,
    defaultSourceId: document.defaultSourceId.toString(),
    startMonth: document.startMonth,
    endMonth: document.endMonth ?? null,
    monthOverrides: (document.monthOverrides ?? []).map((override) => {
      const item: IExpense['monthOverrides'][number] = { month: override.month };
      if (override.amount !== undefined && override.amount !== null) {
        item.amount = Number(override.amount);
      }
      if (override.sourceId) {
        item.sourceId = override.sourceId.toString();
      }
      return item;
    }),
  };
}
