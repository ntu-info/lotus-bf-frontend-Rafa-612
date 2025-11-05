// src/styles/designSystem.js
// Unified Design System for SynapseHub - Enhanced Blue Theme

export const colors = {
  // 優化後的藍色系統 - 更柔和、更有質感
  primary: {
    50: '#f0f9ff',   // 極淺天空藍 - 更清新
    100: '#e0f2fe',  // 淺天空藍 - Panel headers 使用
    200: '#bae6fd',  // 柔和藍
    300: '#7dd3fc',  // 明亮藍
    400: '#38bdf8',  // 天空藍
    500: '#0ea5e9',  // 主藍色 - 更鮮明
    600: '#0284c7',  // 深藍 - 按鈕使用
    700: '#0369a1',  // 深海藍
    800: '#075985',  // 暗藍
    900: '#0c4a6e',  // 深邃藍
  },
  
  // 輔助藍色 - 用於特殊強調
  accent: {
    blue: '#06b6d4',    // 青藍色 - 用於 hover
    indigo: '#6366f1',  // 靛藍色 - 用於特殊標記
    sky: '#38bdf8',     // 天空藍 - 用於高亮
  },
  
  gray: {
    50: '#fafafa',   // 更溫暖的淺灰
    100: '#f5f5f5',  // 
    200: '#e5e5e5',  // 
    300: '#d4d4d4',  // 
    400: '#a3a3a3',  // 
    500: '#737373',  // 
    600: '#525252',  // 
    700: '#404040',  // 
    800: '#262626',  // 
    900: '#171717',  // 
  },
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',  // 使用新的藍色
  
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',  // 更溫暖
    tertiary: '#f5f5f5',
  },
  
  text: {
    primary: '#171717',    // 更深的黑
    secondary: '#404040',  // 
    tertiary: '#737373',   // 
    disabled: '#a3a3a3',
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
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.75,
};

export const borderRadius = {
  none: '0',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  // 特殊藍色陰影 - 讓元素更有深度
  blue: '0 4px 14px 0 rgba(14, 165, 233, 0.15)',
  blueLg: '0 8px 24px 0 rgba(14, 165, 233, 0.2)',
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
    border: '1px solid #e5e5e5',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  },
  
  button: {
    primary: {
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',  // 漸層按鈕
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: 600,
      border: 'none',
      cursor: 'pointer',
      transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 1px 3px 0 rgba(14, 165, 233, 0.3)',
      hover: {
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        boxShadow: '0 4px 12px 0 rgba(14, 165, 233, 0.4)',
        transform: 'translateY(-1px)',
      },
      active: {
        background: '#0369a1',
        transform: 'translateY(0)',
      },
      disabled: {
        background: '#d4d4d4',
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    },
    secondary: {
      background: '#f5f5f5',
      color: '#404040',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: 600,
      border: '1px solid #e5e5e5',
      cursor: 'pointer',
      transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      hover: {
        background: '#e5e5e5',
        borderColor: '#d4d4d4',
      },
    },
  },
  
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '2px solid #e5e5e5',
    fontSize: '0.875rem',
    color: '#171717',
    background: '#ffffff',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    focus: {
      outline: 'none',
      borderColor: '#38bdf8',
      boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.1)',
      transform: 'translateY(-1px)',
    },
    hover: {
      borderColor: '#bae6fd',
    },
  },
  
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e5e5',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '16px 24px',
  },
  
  // Panel header 樣式 - 更有層次感
  panelHeader: {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',  // 淡藍漸層
    borderBottom: '1px solid #bae6fd',
    padding: '12px 16px',
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
  
  panelHeader: (customStyles = {}) => ({
    ...components.panelHeader,
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