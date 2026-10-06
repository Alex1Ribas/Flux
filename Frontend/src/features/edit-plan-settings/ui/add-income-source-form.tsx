import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { apiErrorMessage } from '@/shared/api/api-client';
import { formatMoneyInput } from '@/shared/lib/money-input';
import { useCreateIncomeSource } from '../api/use-create-income-source';
import { validateIncomeSource, type IIncomeSourceForm } from '../model/validate-income-source';

const EMPTY_FORM: IIncomeSourceForm = { name: '', payDay: '', amount: '' };
const INPUT_CLASS =
  'h-[44px] px-3 rounded-control border border-border-subtle bg-card-bg text-body-md text-text-primary';

export const AddIncomeSourceForm = () => {
  const [form, setForm] = useState<IIncomeSourceForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const createIncomeSource = useCreateIncomeSource();

  const update = (field: keyof IIncomeSourceForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const submit = async () => {
    const result = validateIncomeSource(form);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    try {
      await createIncomeSource.mutateAsync(result.input);
      setForm(EMPTY_FORM);
    } catch (submitError) {
      setError(apiErrorMessage(submitError, 'Não foi possível salvar a renda.'));
    }
  };

  return (
    <View className="w-full gap-2 pt-3 border-t border-border-subtle">
      <Text className="text-body-sm font-bold text-muted">Adicionar renda</Text>
      <View className="flex-row flex-wrap gap-2">
        <TextInput
          className={`${INPUT_CLASS} flex-1 min-w-[160px]`}
          value={form.name}
          onChangeText={(text) => update('name', text)}
          placeholder="Nome (ex.: Salário)"
          placeholderTextColor="#667085"
          accessibilityLabel="Nome da renda"
        />
        <TextInput
          className={`${INPUT_CLASS} w-[90px] font-mono`}
          value={form.payDay}
          onChangeText={(text) => update('payDay', text.replace(/\D/g, ''))}
          placeholder="Dia"
          placeholderTextColor="#667085"
          keyboardType="numeric"
          accessibilityLabel="Dia do pagamento"
        />
        <TextInput
          className={`${INPUT_CLASS} w-[140px] font-mono`}
          value={form.amount}
          onChangeText={(text) => update('amount', formatMoneyInput(text))}
          placeholder="R$ 0,00"
          placeholderTextColor="#667085"
          keyboardType="numeric"
          accessibilityLabel="Valor mensal da renda"
        />
        <Pressable
          onPress={() => {
            void submit();
          }}
          disabled={createIncomeSource.isPending}
          className="h-[44px] px-4 rounded-control bg-primary-container items-center justify-center"
          accessibilityRole="button"
        >
          {createIncomeSource.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-title-sm text-on-primary font-bold">Adicionar</Text>
          )}
        </Pressable>
      </View>
      {error ? <Text className="text-danger-text text-body-sm">{error}</Text> : null}
    </View>
  );
};
