import Constants from 'expo-constants';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHost = Constants.expoConfig?.hostUri
  ?.replace(/^https?:\/\//, '')
  .split(':')[0];

/**
 * In development, use the same LAN host that serves the Expo bundle.
 * EXPO_PUBLIC_API_URL can override it for production, tunnels, or custom environments.
 */
export const API_BASE_URL =
  configuredApiUrl || (expoHost ? `http://${expoHost}:4000` : 'http://localhost:4000');

export const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
  },
  taamim: {
    list: `${API_BASE_URL}/taamim`,
  },
  audio: {
    evaluate: `${API_BASE_URL}/audio/evaluate`,
  },
} as const;
