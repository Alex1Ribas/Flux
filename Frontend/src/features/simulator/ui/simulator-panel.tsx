import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EDecisionMode, EVerdictKind, type IVerdict } from '@/entities/decision/model/verdict';
import { formatMoney } from '@/shared/lib/format-money';
import { cn } from '@/shared/lib/cn';
import { SurfaceCard } from '@/shared/ui/surface-card';
import { SIMULATOR_MODES } from '../model/simulator-form';
import { useSimulator } from '../model/use-simulator';

const verdictStyles: Record<
  EVerdictKind,
  { box: string; title: string; icon: string }
> = {
  [EVerdictKind.OK]: {
    box: 'bg-positive-soft border-positive-green',
    title: 'text-positive-green',
    icon: '✓',
  },
  [EVerdictKind.WARN]: {
    box: 'bg-warning-soft border-warning-border',
    title: 'text-warning-amber',
    icon: '!',
  },
  [EVerdictKind.BAD]: {
    box: 'bg-danger-soft border-danger-border',
    title: 'text-danger-red',
    icon: '×',
  },
  [EVerdictKind.INFO]: {
    box: 'bg-brand-blue-soft border-brand-blue-border',
    title: 'text-brand-blue-text',
    icon: 'i',
  },
};

const Field = ({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder = 'R$ 0,00',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  placeholder?: string;
}) => (
  <View className="gap-1.5">
    <Text className="text-body-sm font-bold text-text-primary">{label}</Text>
    <TextInput
      className="w-full h-[42px] px-3 rounded-control border border-border-subtle bg-card-bg text-body-md text-text-primary font-mono"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor="#667085"
    />
  </View>
);

const MetricChip = ({ label, value }: { label: string; value: string }) => (
  <SurfaceCard className="w-[140px] gap-1.5 mr-space-md" padded>
    <Text className="text-label-caps text-muted uppercase">{label}</Text>
    <Text className="font-mono text-label-numeric-md text-text-primary">
      {value}
    </Text>
  </SurfaceCard>
);

const VerdictCard = ({ verdict }: { verdict: IVerdict }) => {
  const style = verdictStyles[verdict.kind] ?? verdictStyles[EVerdictKind.INFO];

  return (
    <View className={cn('mt-5 p-[15px] rounded-md border', style.box)}>
      <View className="flex-row gap-3 items-start">
        <Text className={cn('text-xl font-bold', style.title)}>{style.icon}</Text>
        <View className="flex-1 gap-1">
          <Text className={cn('text-title-sm font-bold', style.title)}>
            {verdict.title}
          </Text>
          <Text className="text-label-caps text-muted uppercase">
            {verdict.impact}
          </Text>
        </View>
      </View>

      {verdict.details.length > 0 ? (
        <View className="mt-3 gap-2">
          {verdict.details.map((detail) => (
            <View
              key={`${detail.label}-${detail.value}`}
              className="rounded-control bg-card-bg border border-border-subtle px-2.5 py-2 flex-row justify-between gap-3"
            >
              <Text className="text-muted text-body-sm">{detail.label}</Text>
              <Text className="font-bold font-mono text-text-primary text-body-sm">
                {detail.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text className="text-body-md text-text-primary mt-3 leading-5">
        {verdict.message}
      </Text>
    </View>
  );
};

export const SimulatorPanel = () => {
  const {
    mode,
    setMode,
    form,
    updateField,
    verdict,
    isLoading,
    currentMonth,
    planError,
  } = useSimulator();

  return (
    <View className="gap-space-xl">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="pr-2"
      >
        <MetricChip
          label="Renda"
          value={currentMonth ? formatMoney(currentMonth.income) : '—'}
        />
        <MetricChip
          label="Contas"
          value={currentMonth ? formatMoney(currentMonth.spend) : '—'}
        />
        <MetricChip
          label="Reserva"
          value={currentMonth ? formatMoney(currentMonth.reserve) : '—'}
        />
        <MetricChip
          label="Livre"
          value={currentMonth ? formatMoney(currentMonth.free) : '—'}
        />
      </ScrollView>

      {planError ? (
        <View className="p-[15px] rounded-md bg-danger-soft border border-danger-border">
          <Text className="text-danger-text text-body-sm">
            Não foi possível carregar o mês atual. Tente novamente em instantes.
          </Text>
        </View>
      ) : null}

      <SurfaceCard className="gap-4">
        <View>
          <Text className="text-headline-sm text-text-primary font-bold">
            Simulador de decisão
          </Text>
          <Text className="text-body-md text-muted mt-1">
            Usa o livre do mês em curso do planejamento.
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {SIMULATOR_MODES.map((option) => {
            const isActive = option.mode === mode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => setMode(option.mode)}
                className={cn(
                  'px-3 py-2 rounded-control border min-h-[42px] justify-center',
                  isActive
                    ? 'border-primary-container bg-brand-blue-soft'
                    : 'border-border-subtle bg-card-bg',
                )}
              >
                <Text
                  className={cn(
                    'text-title-sm',
                    isActive ? 'text-brand-blue-text' : 'text-muted',
                  )}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === EDecisionMode.HOJE ? (
          <View className="gap-3.5">
            <Field
              label="Disponível agora"
              value={form.available}
              onChangeText={(text) => updateField('available', text)}
              keyboardType="numeric"
              placeholder="Livre do mês (automático)"
            />
            <Field
              label="Gasto pretendido"
              value={form.expense}
              onChangeText={(text) => updateField('expense', text)}
              keyboardType="numeric"
            />
          </View>
        ) : null}

        {mode === EDecisionMode.PARCELA ? (
          <View className="gap-3.5">
            <Field
              label="Valor total"
              value={form.total}
              onChangeText={(text) => updateField('total', text)}
              keyboardType="numeric"
            />
            <Field
              label="Nº de parcelas"
              value={form.installments}
              onChangeText={(text) => updateField('installments', text)}
              keyboardType="numeric"
            />
          </View>
        ) : null}

        {mode === EDecisionMode.AVISTA ? (
          <View className="gap-3.5">
            <Field
              label="Valor do produto"
              value={form.value}
              onChangeText={(text) => updateField('value', text)}
              keyboardType="numeric"
            />
            <Field
              label="Parcelas alternativas"
              value={form.cashInstallments}
              onChangeText={(text) => updateField('cashInstallments', text)}
              keyboardType="numeric"
            />
            <Field
              label="Disponível no mês"
              value={form.cashAvailable}
              onChangeText={(text) => updateField('cashAvailable', text)}
              keyboardType="numeric"
              placeholder="Livre do mês (automático)"
            />
          </View>
        ) : null}

        {isLoading && !verdict ? (
          <ActivityIndicator color="#2563eb" />
        ) : null}

        {verdict ? <VerdictCard verdict={verdict} /> : null}
      </SurfaceCard>
    </View>
  );
};
