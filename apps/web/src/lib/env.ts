function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl) {
    const normalizedUrl = configuredUrl.replace(/\/$/, '');
    const isLoopbackUrl = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(normalizedUrl);

    if (import.meta.env.DEV || !isLoopbackUrl) {
      return normalizedUrl;
    }
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:4000/api/v1';
  }

  return '/api/v1';
}

const apiBaseUrl = getApiBaseUrl();

export const env = {
  apiBaseUrl,
  isApiConfigured: Boolean(apiBaseUrl),
  appName: import.meta.env.VITE_APP_NAME ?? 'VC Intelligence',
  appRegion: import.meta.env.VITE_APP_REGION ?? 'Malaysia and Southeast Asia'
};

