import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { IIncomeSource, IPlanningSettings } from '@/entities/planning/model/planning';
import { formatMoneyFromNumber, formatMoneyInput, parseMoneyInput } from '@/shared/lib/money-input';
import { SurfaceCard } from '@/shared/ui/surface-card';
import { useUpdateIncomeSource } from '../api/use-update-income-source';
import { AddIncomeSourceForm } from './add-income-source-form';
import { useUpdatePlanSettings } from '../api/use-update-plan-settings';

interface ISettingsFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onCommit: () => void;
  suffix?: string;
}

const SettingsField = ({ label, value, onChangeText, onCommit, suffix }: ISettingsFieldProps) => (
  <View className="gap-1.5 min-w-[150px] flex-1">
    <Text className="text-body-sm font-bold text-muted">{label}</Text>
    <View className="h-[44px] flex-row items-center rounded-control border border-border-subtle bg-surface px-3">
      <TextInput
        className="flex-1 text-body-md text-text-primary font-mono"
        value={value}
        onChangeText={onChangeText}
        onEndEditing={onCommit}
        onBlur={onCommit}
        keyboardType="numeric"
        accessibilityLabel={label}
      />
      {suffix ? <Text className="text-body-md text-muted">{suffix}</Text> : null}
    </View>
  </View>
);

interface IIncomeSourceFieldProps {
  source: IIncomeSource;
}

const IncomeSourceField = ({ source }: IIncomeSourceFieldProps) => {
  const [value, setValue] = useState(formatMoneyFromNumber(source.amount));
  const updateIncomeSource = useUpdateIncomeSource();

  useEffect(() => {
    setValue(formatMoneyFromNumber(source.amount));
  }, [source.amount]);

  const commit = () => {
    const amount = parseMoneyInput(value);
    if (amount === source.amount) {
      return;
    }
    updateIncomeSource.mutate({ sourceId: source.id, amount });
  };

  return (
    <SettingsField
      label={`${source.name} · todo dia ${source.payDay}`}
      value={value}
      onChangeText={(text) => setValue(formatMoneyInput(text))}
      onCommit={commit}
    />
  );
};

interface IPlanSettingsPanelProps {
  settings: IPlanningSettings;
  incomeSources: IIncomeSource[];
}

export const PlanSettingsPanel = ({ settings, incomeSources }: IPlanSettingsPanelProps) => {
  const [open, setOpen] = useState(incomeSources.length === 0);
  const [reserveRate, setReserveRate] = useState(String(settings.reserveRate));
  const [initialReserve, setInitialReserve] = useState(formatMoneyFromNumber(settings.initialReserve));
  const updateSettings = useUpdatePlanSettings();

  useEffect(() => {
    setReserveRate(String(settings.reserveRate));
    setInitialReserve(formatMoneyFromNumber(settings.initialReserve));
  }, [settings.reserveRate, settings.initialReserve]);

  const commitReserveRate = () => {
    const parsed = Math.min(100, Math.max(0, Number(reserveRate.replace(',', '.')) || 0));
    if (parsed === settings.reserveRate) {
      setReserveRate(String(settings.reserveRate));
      return;
    }
    updateSettings.mutate({ reserveRate: parsed });
  };

  const commitInitialReserve = () => {
    const parsed = parseMoneyInput(initialReserve);
    if (parsed === settings.initialReserve) {
      return;
    }
    updateSettings.mutate({ initialReserve: parsed });
  };

  return (
    <SurfaceCard padded={false}>
      <Pressable
        onPress={() => setOpen(!open)}
        className="min-h-[48px] px-4 flex-row items-center gap-2"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text className="text-title-md text-muted">{open ? '⌄' : '›'}</Text>
        <Text className="text-title-sm text-text-primary flex-1">Ajustar entradas e reserva</Text>
        <Text className="text-body-sm text-muted">atualização automática</Text>
      </Pressable>
      {open ? (
        <View className="flex-row flex-wrap gap-3 p-4 border-t border-border-subtle">
          {incomeSources.map((source) => (
            <IncomeSourceField key={source.id} source={source} />
          ))}
          <SettingsField
            label="Reserva sobre a sobra"
            value={reserveRate}
            onChangeText={setReserveRate}
            onCommit={commitReserveRate}
            suffix="%"
          />
          <SettingsField
            label="Reserva atual"
            value={initialReserve}
            onChangeText={(text) => setInitialReserve(formatMoneyInput(text))}
            onCommit={commitInitialReserve}
          />
          <AddIncomeSourceForm />
        </View>
      ) : null}
    </SurfaceCard>
  );
};
