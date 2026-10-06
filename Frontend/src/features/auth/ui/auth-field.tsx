import { Text, TextInput, View } from 'react-native';

interface IAuthFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoComplete?: 'name' | 'email' | 'password' | 'new-password';
}

export const AuthField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboardType,
  autoComplete,
}: IAuthFieldProps) => (
  <View className="gap-1.5">
    <Text className="text-body-sm font-bold text-text-primary">{label}</Text>
    <TextInput
      className="w-full h-[44px] px-3 rounded-control border border-border-subtle bg-card-bg text-body-md text-text-primary"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#667085"
      secureTextEntry={secure}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete={autoComplete}
      keyboardType={keyboardType ?? 'default'}
      accessibilityLabel={label}
    />
  </View>
);
