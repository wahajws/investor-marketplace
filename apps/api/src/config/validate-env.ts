type Env = Record<string, string | undefined>;

const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'APP_FRONTEND_URL'];

export function validateEnv(config: Env) {
  const missing = required.filter((key) => !config[key]);

  if (missing.length) {
    if (!config.VERCEL) {
      throw new Error(`Missing required environment variables: ${[...new Set(missing)].join(', ')}`);
    }
  }

  const nodeEnv = config.NODE_ENV ?? 'development';
  if (nodeEnv === 'production') {
    for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
      const value = config[key] ?? '';
      if (value && (value.length < 32 || value.includes('replace_me') || value.includes('change_me'))) {
        throw new Error(`${key} must be a strong production secret of at least 32 characters.`);
      }
    }
  }

  return config;
}
