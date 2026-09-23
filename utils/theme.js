import { COLORS as LEGACY_COLORS } from './constants';

export const COLORS = {
  primary: LEGACY_COLORS.primary || '#0079BF',
  secondary: LEGACY_COLORS.secondary || '#5AAC44',
  danger: LEGACY_COLORS.danger || '#EB5A46',
  warning: LEGACY_COLORS.warning || '#F2D600',
  dark: LEGACY_COLORS.dark || '#172B4D',
  gray: LEGACY_COLORS.gray || '#6B778C',
  lightGray: LEGACY_COLORS.lightGray || '#DFE1E6',
  background: LEGACY_COLORS.background || '#FAFBFC',

  // App-specific dark theme palette
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  surfaceLighter: '#3a3a3a',
  onSurface: '#ffffff',
  onSurfaceMuted: '#9ca3af',
  border: '#374151',
};

export const TRELLO_BOARD_COLORS = {
  blue: '#0079BF',
  orange: '#D29034',
  green: '#519839',
  red: '#B04632',
  purple: '#89609E',
  pink: '#CD5A91',
  lime: '#4BBF6B',
  sky: '#00AECC',
  grey: '#838C91',
};

export function getBoardColor(color) {
  return TRELLO_BOARD_COLORS[color] || color || TRELLO_BOARD_COLORS.blue;
}
