// Form validation utilities

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface FieldValidation {
  value: string;
  rules: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Common validation rules
export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value: string) => value.trim().length > 0,
    message,
  }),

  email: (message = 'Please enter a valid email'): ValidationRule => ({
    test: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value: string) => value.length >= min,
    message: message || `Minimum ${min} characters required`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value: string) => value.length <= max,
    message: message || `Maximum ${max} characters allowed`,
  }),

  numeric: (message = 'Please enter a valid number'): ValidationRule => ({
    test: (value: string) => /^\d+$/.test(value),
    message,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    test: (value: string) => /^\+?[\d\s-()]{10,}$/.test(value),
    message,
  }),

  password: (message = 'Password must be at least 8 characters'): ValidationRule => ({
    test: (value: string) => value.length >= 8,
    message,
  }),

  match: (fieldName: string, getFieldValue: () => string, message?: string): ValidationRule => ({
    test: (value: string) => value === getFieldValue(),
    message: message || `Must match ${fieldName}`,
  }),
};

// Validate a single field
export const validateField = (value: string, rules: ValidationRule[]): string => {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }
  return '';
};

// Validate all fields in a form
export const validateForm = (
  fields: {[key: string]: FieldValidation},
): ValidationResult => {
  const errors: ValidationErrors = {};
  let isValid = true;

  for (const [fieldName, field] of Object.entries(fields)) {
    const error = validateField(field.value, field.rules);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  }

  return {isValid, errors};
};

// Email validation helper
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  suggestions: string[];
} => {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Use at least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Add uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Add numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Add special characters');
  }

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const labelIndex = Math.min(Math.floor((score / 5) * 4), 4);

  return {
    score,
    label: labels[labelIndex],
    suggestions,
  };
};

// Trimming helper
export const sanitizeInput = (input: string): string => {
  return input.trim();
};
