import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { monthLabel } from '@/entities/planning/model/month-label';
import type { IIncomeSource } from '@/entities/planning/model/planning';
import { apiErrorMessage } from '@/shared/api/api-client';
import { cn } from '@/shared/lib/cn';
import { primaryButtonShadowStyle } from '@/shared/lib/elevation';
import { formatMoneyInput } from '@/shared/lib/money-input';
import { useCreateExpense } from '../api/use-create-expense';
import {
  buildCreateExpensePayload,
  shiftMonthKey,
  type ICreateExpenseForm,
} from '../model/build-create-expense-payload';

interface ICreateExpenseButtonProps {
  currentMonth: string;
  incomeSources: IIncomeSource[];
  initialMonth?: string;
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

export const CreateExpenseButton = ({ currentMonth, incomeSources, initialMonth }: ICreateExpenseButtonProps) => {
  let defaultStartMonth = currentMonth;
  if (initialMonth && initialMonth > currentMonth) {
    defaultStartMonth = initialMonth;
  }
  const emptyForm = (): ICreateExpenseForm => ({
    name: '',
    amount: formatMoneyInput('0'),
    dueDay: '',
    note: '',
    sourceId: null,
    startMonth: defaultStartMonth,
    installments: '',
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ICreateExpenseForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const createExpense = useCreateExpense();

  const update = <TField extends keyof ICreateExpenseForm>(field: TField, value: ICreateExpenseForm[TField]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const close = () => {
    setOpen(false);
    setForm(emptyForm());
    setError(null);
  };

  const submit = async () => {
    const result = buildCreateExpensePayload(form, currentMonth);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    try {
      await createExpense.mutateAsync(result.payload);
      close();
    } catch (submitError) {
      setError(apiErrorMessage(submitError, 'Não foi possível salvar a conta.'));
    }
  };

  const followingMonth = shiftMonthKey(currentMonth, 1);
  const selectedLabel = monthLabel(form.startMonth);
  const canGoBack = form.startMonth > currentMonth;

  return (
    <>
      <Pressable
        onPress={() => {
          setForm(emptyForm());
          setOpen(true);
        }}
        className="bg-primary-container rounded-control px-4 min-h-[44px] flex-row items-center justify-center"
        style={primaryButtonShadowStyle}
        accessibilityRole="button"
      >
        <Text className="text-on-primary text-title-sm font-bold">+ Conta</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View className="flex-1 justify-center px-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.52)' }}>
          <View className="bg-card-bg rounded-lg p-5 gap-4 border border-border-subtle max-h-[90%] w-full max-w-[480px] self-center">
            <View className="flex-row items-center justify-between">
              <Text className="text-headline-sm text-text-primary font-bold">Nova conta</Text>
              <Pressable onPress={close} accessibilityLabel="Fechar">
                <Text className="text-muted text-title-md">×</Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <View className="gap-3.5">
                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Nome</Text>
                  <TextInput
                    className={INPUT_CLASS}
                    value={form.name}
                    onChangeText={(text) => update('name', text)}
                    placeholder="Ex.: Aluguel, Internet"
                    placeholderTextColor="#667085"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 gap-1.5">
                    <Text className="text-body-sm font-bold text-text-primary">Valor mensal</Text>
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
                      className={cn(INPUT_CLASS, 'font-mono')}
                      value={form.dueDay}
                      onChangeText={(text) => update('dueDay', text.replace(/\D/g, ''))}
                      keyboardType="numeric"
                      placeholder="—"
                      placeholderTextColor="#667085"
                    />
                  </View>
                </View>

                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Observação</Text>
                  <TextInput
                    className={INPUT_CLASS}
                    value={form.note}
                    onChangeText={(text) => update('note', text)}
                    placeholder="Ex.: parcela, fecha dia 17"
                    placeholderTextColor="#667085"
                  />
                </View>

                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Sai de qual renda</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Chip label="Pelo dia" active={form.sourceId === null} onPress={() => update('sourceId', null)} />
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

                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Começa em</Text>
                  <View className="flex-row items-center justify-between gap-2">
                    <Pressable
                      onPress={() => update('startMonth', shiftMonthKey(form.startMonth, -1))}
                      disabled={!canGoBack}
                      accessibilityRole="button"
                      accessibilityLabel="Mês anterior"
                      accessibilityState={{ disabled: !canGoBack }}
                      className={cn(
                        'w-11 min-h-[40px] rounded-control border border-border-subtle bg-card-bg items-center justify-center',
                        !canGoBack && 'opacity-40',
                      )}
                    >
                      <Text className="text-title-md text-text-primary">‹</Text>
                    </Pressable>
                    <Text className="text-title-sm text-text-primary font-bold">
                      {selectedLabel.name}/{selectedLabel.year}
                    </Text>
                    <Pressable
                      onPress={() => update('startMonth', shiftMonthKey(form.startMonth, 1))}
                      accessibilityRole="button"
                      accessibilityLabel="Próximo mês"
                      className="w-11 min-h-[40px] rounded-control border border-border-subtle bg-card-bg items-center justify-center"
                    >
                      <Text className="text-title-md text-text-primary">›</Text>
                    </Pressable>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    <Chip label="Este mês" active={form.startMonth === currentMonth} onPress={() => update('startMonth', currentMonth)} />
                    <Chip label="Próximo mês" active={form.startMonth === followingMonth} onPress={() => update('startMonth', followingMonth)} />
                  </View>
                </View>

                <View className="gap-1.5">
                  <Text className="text-body-sm font-bold text-text-primary">Parcelas</Text>
                  <TextInput
                    className={cn(INPUT_CLASS, 'font-mono')}
                    value={form.installments}
                    onChangeText={(text) => update('installments', text.replace(/\D/g, ''))}
                    keyboardType="numeric"
                    placeholder="Vazio = sem data para acabar"
                    placeholderTextColor="#667085"
                  />
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
                disabled={createExpense.isPending}
                className="px-4 py-2.5 rounded-control bg-primary-container min-w-[96px] items-center"
                style={primaryButtonShadowStyle}
              >
                {createExpense.isPending ? (
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
