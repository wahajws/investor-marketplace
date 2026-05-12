function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:4000/api/v1';
  }

  throw new Error('Missing VITE_API_BASE_URL. Set it to your deployed API URL, for example https://api.your-domain.com/api/v1.');
}

export const env = {
  apiBaseUrl: getApiBaseUrl(),
  appName: import.meta.env.VITE_APP_NAME ?? 'VC Intelligence',
  appRegion: import.meta.env.VITE_APP_REGION ?? 'Malaysia and Southeast Asia'
};

