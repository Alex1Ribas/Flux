import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { dueLabel, monthLabel } from '@/entities/planning/model/month-label';
import type { IIncomeSource, IPlanExpenseLine } from '@/entities/planning/model/planning';
import { apiErrorMessage } from '@/shared/api/api-client';
import { cn } from '@/shared/lib/cn';
import { primaryButtonShadowStyle } from '@/shared/lib/elevation';
import { formatMoney } from '@/shared/lib/format-money';
import { formatMoneyInput } from '@/shared/lib/money-input';
import { useSetExpenseMonth } from '../api/use-set-expense-month';
import { useUpdateExpense } from '../api/use-update-expense';
import {
  buildEditExpensePayload,
  editExpenseFormFromLine,
  type IEditExpenseForm,
  type TEditExpenseScope,
} from '../model/build-edit-expense-payload';

interface IExpenseEditRowProps {
  month: string;
  line: IPlanExpenseLine;
  incomeSources: IIncomeSource[];
}

interface IChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const Chip = ({ label, active, onPress }: IChipProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ selected: active }}
    className={cn(
      'px-3 min-h-[40px] rounded-control border items-center justify-center',
      active ? 'border-primary-container bg-brand-blue-soft' : 'border-border-subtle bg-card-bg',
    )}
  >
    <Text className={cn('text-title-sm', active ? 'text-brand-blue-text' : 'text-muted')}>{label}</Text>
  </Pressable>
);

const INPUT_CLASS =
  'w-full h-[42px] px-3 rounded-control border border-border-subtle bg-card-bg text-body-md text-text-primary';

export const ExpenseEditRow = ({ month, line, incomeSources }: IExpenseEditRowProps) => {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<TEditExpenseScope>('month');
  const [form, setForm] = useState<IEditExpenseForm>(() => editExpenseFormFromLine(line));
  const [error, setError] = useState<string | null>(null);
  const setExpenseMonth = useSetExpenseMonth();
  const updateExpense = useUpdateExpense();
  const isSaving = setExpenseMonth.isPending || updateExpense.isPending;
  const isMonthScope = scope === 'month';
  const sourceName = incomeSources.find((source) => source.id === line.sourceId)?.name ?? '';
  const viewedMonth = monthLabel(month);

  const update = <TField extends keyof IEditExpenseForm>(field: TField, value: IEditExpenseForm[TField]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const openEditor = () => {
    setForm(editExpenseFormFromLine(line));
    setScope('month');
    setError(null);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const submit = async () => {
    const result = buildEditExpensePayload(form, scope);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    try {
      if (result.scope === 'month') {
        await setExpenseMonth.mutateAsync({ expenseId: line.expenseId, month, ...result.payload });
      } else {
        await updateExpense.mutateAsync({ expenseId: line.expenseId, payload: result.payload });
      }
      close();
    } catch (submitError) {
      setError(apiErrorMessage(submitError, 'Não foi possível salvar a conta.'));
    }
  };

  let scopeHint = 'Ajustes feitos em meses específicos serão substituídos.';
  if (isMonthScope) {
    scopeHint = `Altera só ${viewedMonth.name}/${viewedMonth.year}. Nome e dia valem para todos os meses.`;
  }

  return (
    <>
      <Pressable
        onPress={openEditor}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${line.name}`}
        className={cn(
          'px-4 py-3 flex-row items-center gap-3 border-t border-border-subtle',
          line.amount === 0 ? 'opacity-60' : '',
        )}
      >
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <Text className="text-title-sm text-text-primary">{line.name}</Text>
            {line.isAdjusted ? (
              <View className="px-1.5 py-0.5 rounded-full bg-warning-soft">
                <Text className="text-badge-micro text-warning-text uppercase">ajustado</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-body-sm text-muted">
            {dueLabel(line.dueDay, line.dueNote)} · {sourceName}
          </Text>
        </View>
        <Text className="text-title-sm text-text-primary font-mono">{formatMoney(line.amount)}</Text>
        <Text className="text-title-md text-muted">›</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View className="flex-1 justify-center px-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.52)' }}>
          <View className="bg-card-bg rounded-lg p-5 gap-4 border border-border-subtle max-h-[90%] w-full max-w-[480px] self-center">
            <View className="flex-row items-center justify-between">
              <Text className="text-headline-sm text-text-primary font-bold">Editar conta</Text>
              <Pressable onPress={close} accessibilityLabel="Fechar">
                <Text className="text-muted text-title-md">×</Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <View className="gap-3.5">
                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Aplicar em</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Chip label="Só este mês" active={isMonthScope} onPress={() => setScope('month')} />
                    <Chip label="Todos os meses" active={!isMonthScope} onPress={() => setScope('all')} />
                  </View>
                  <Text className="text-body-sm text-muted">{scopeHint}</Text>
                </View>

                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Nome</Text>
                  <TextInput
                    className={cn(INPUT_CLASS, isMonthScope && 'opacity-50')}
                    value={form.name}
                    onChangeText={(text) => update('name', text)}
                    editable={!isMonthScope}
                    placeholderTextColor="#667085"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 gap-1.5">
                    <Text className="text-body-sm font-bold text-text-primary">Valor</Text>
                    <TextInput
                      className={cn(INPUT_CLASS, 'font-mono')}
                      value={form.amount}
                      onChangeText={(text) => update('amount', formatMoneyInput(text))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="w-24 gap-1.5">
                    <Text className="text-body-sm font-bold text-text-primary">Dia</Text>
                    <TextInput
                      className={cn(INPUT_CLASS, 'font-mono', isMonthScope && 'opacity-50')}
                      value={form.dueDay}
                      onChangeText={(text) => update('dueDay', text.replace(/\D/g, ''))}
                      editable={!isMonthScope}
                      keyboardType="numeric"
                      placeholder="—"
                      placeholderTextColor="#667085"
                    />
                  </View>
                </View>

                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Observação</Text>
                  <TextInput
                    className={cn(INPUT_CLASS, isMonthScope && 'opacity-50')}
                    value={form.note}
                    onChangeText={(text) => update('note', text)}
                    editable={!isMonthScope}
                    placeholder="Ex.: parcela, fecha dia 17"
                    placeholderTextColor="#667085"
                  />
                </View>

                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Sai de qual renda</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {incomeSources.map((source) => (
                      <Chip
                        key={source.id}
                        label={source.name}
                        active={form.sourceId === source.id}
                        onPress={() => update('sourceId', source.id)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            {error ? <Text className="text-danger-text text-body-sm">{error}</Text> : null}

            <View className="flex-row gap-2 justify-end">
              <Pressable onPress={close} className="px-4 py-2.5 rounded-control border border-border-subtle bg-card-bg">
                <Text className="text-title-sm text-text-primary font-bold">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void submit();
                }}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-control bg-primary-container min-w-[96px] items-center"
                style={primaryButtonShadowStyle}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-title-sm text-on-primary font-bold">Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
