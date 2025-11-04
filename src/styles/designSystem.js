// src/styles/designSystem.js
// Unified Design System for LoTUS-BF

export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },
  
  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6b7280',
    disabled: '#9ca3af',
    inverse: '#ffffff',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
};

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
};

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

export const borderRadius = {
  none: '0',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const components = {
  card: {
    padding: '24px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  
  button: {
    primary: {
      background: '#2563eb',
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
      transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      hover: {
        background: '#1d4ed8',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      active: {
        background: '#1e40af',
      },
      disabled: {
        background: '#d1d5db',
        cursor: 'not-allowed',
      },
    },
    secondary: {
      background: '#f3f4f6',
      color: '#374151',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
      transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      hover: {
        background: '#e5e7eb',
      },
    },
  },
  
  input: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    color: '#111827',
    background: '#ffffff',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    focus: {
      outline: 'none',
      borderColor: 'transparent',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
      transform: 'translateY(-0.5px)',
    },
    hover: {
      borderColor: '#9ca3af',
    },
  },
  
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    padding: '16px 24px',
  },
};

export const createStyles = {
  card: (customStyles = {}) => ({
    ...components.card,
    ...customStyles,
  }),
  
  button: (variant = 'primary', customStyles = {}) => ({
    ...components.button[variant],
    ...customStyles,
  }),
  
  input: (customStyles = {}) => ({
    ...components.input,
    ...customStyles,
  }),
};

export default {
  colors,
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  borderRadius,
  shadows,
  transitions,
  components,
  createStyles,
};