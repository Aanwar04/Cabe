/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
  TextInput as RNTextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: theme.colors.primary };
      case 'secondary':
        return { ...baseStyle, backgroundColor: theme.colors.secondary };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'danger':
        return { ...baseStyle, backgroundColor: theme.colors.error };
      default:
        return baseStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 12, paddingVertical: 6, height: 36 };
      case 'large':
        return { paddingHorizontal: 24, paddingVertical: 16, height: 56 };
      default:
        return { paddingHorizontal: 20, paddingVertical: 12, height: 48 };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = { fontWeight: '600' };
    switch (size) {
      case 'small':
        return { ...baseStyle, fontSize: 12 };
      case 'large':
        return { ...baseStyle, fontSize: 18 };
      default:
        return { ...baseStyle, fontSize: 14 };
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline') {
      return theme.colors.primary;
    }
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), getSizeStyle(), (disabled || loading) && { opacity: 0.6 }, style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} style={{ marginRight: 8 }} />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
          <Text style={[getTextStyle(), { color: getTextColor() }]}>{title}</Text>
          {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

// Card component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const { theme } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Wrapper>
  );
};

// Input component
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.textInputContainer,
          {
            backgroundColor: theme.colors.background,
            borderColor: error ? theme.colors.error : theme.colors.border,
          },
        ]}
      >
        <RNTextInput
          style={[
            styles.textInput,
            { color: theme.colors.text, textAlignVertical: multiline ? 'top' : 'center' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  textInputContainer: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  textInput: { fontSize: 14, paddingVertical: 10 },
  errorText: { fontSize: 12, marginTop: 4 },
});

export default Button;
