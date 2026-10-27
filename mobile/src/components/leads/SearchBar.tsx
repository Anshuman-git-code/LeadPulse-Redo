/**
 * SearchBar — styled text input for the dark LeadPulse palette.
 * Accepts text and fires onChangeText; filtering logic stays in the screen.
 */
import { StyleSheet, TextInput, View } from 'react-native';

import { LeadPulseColors, Radius, Spacing, Typography } from '@/constants/leadpulse-theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search leads…' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={LeadPulseColors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        accessibilityLabel="Search leads"
        accessibilityRole="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: LeadPulseColors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: LeadPulseColors.surfaceBorder,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.two,
    marginHorizontal: Spacing.threeHalf,
  },
  input: {
    ...Typography.body,
    color: LeadPulseColors.textPrimary,
    padding: 0,
  },
});
