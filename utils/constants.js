// import 'dotenv/config';

// export const TRELLO_CONFIG = {
//   APP_NAME: process.env.APP_NAME || 'TRELLTECH',
//   API_BASE_URL: process.env.API_BASE_URL || 'https://api.trello.com/1',
//   API_KEY: process.env.TRELLTECH_API_KEY || 'YOUR_API_KEY_HERE',
//   OAUTH_CALLBACK: process.env.OAUTH_CALLBACK || 'trelltech://oauth-callback',
//   SCOPES: process.env.SCOPES || 'read,write,account',
// };

export const TRELLO_CONFIG = {
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  API_KEY: process.env.EXPO_PUBLIC_TRELLTECH_API_KEY,
  OAUTH_CALLBACK: process.env.EXPO_PUBLIC_OAUTH_CALLBACK,
  SCOPES: process.env.EXPO_PUBLIC_SCOPES
};

export const COLORS = {
  primary: '#0079BF',
  secondary: '#5AAC44',
  danger: '#EB5A46',
  warning: '#F2D600',
  dark: '#172B4D',
  gray: '#6B778C',
  lightGray: '#DFE1E6',
  background: '#FAFBFC',
};