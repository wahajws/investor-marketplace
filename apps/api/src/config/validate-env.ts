type Env = Record<string, string | undefined>;

const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'APP_FRONTEND_URL'];

export function validateEnv(config: Env) {
  const nodeEnv = config.NODE_ENV ?? 'development';
  const missing = required.filter((key) => !config[key]);

  if (nodeEnv === 'production') {
    missing.push(...['ALIBABA_API_KEY', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'].filter((key) => !config[key]));
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${[...new Set(missing)].join(', ')}`);
  }

  if (nodeEnv === 'production') {
    for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
      const value = config[key] ?? '';
      if (value.length < 32 || value.includes('replace_me') || value.includes('change_me')) {
        throw new Error(`${key} must be a strong production secret of at least 32 characters.`);
      }
    }
  }

  return config;
}
