function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:4000/api/v1';
  }

  return null;
}

const apiBaseUrl = getApiBaseUrl();

export const env = {
  apiBaseUrl,
  isApiConfigured: Boolean(apiBaseUrl),
  appName: import.meta.env.VITE_APP_NAME ?? 'VC Intelligence',
  appRegion: import.meta.env.VITE_APP_REGION ?? 'Malaysia and Southeast Asia'
};

