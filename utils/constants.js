export const REDDIT_CONFIG = {
  CLIENT_ID: 'dQw4w9WgXcQ', // TODO: REMPLACE real my Client ID
  REDIRECT_URI: 'exp://192.168.1.123:8081', // TODO: REMPLACE by my IP
  RESPONSE_TYPE: 'token',
  SCOPE: 'identity read subscribe mysubreddits',
  STATE: 'random_string_12345',
};

export const REDDIT_API_BASE = 'https://oauth.reddit.com';
export const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize';