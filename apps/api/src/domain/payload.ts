import { BadRequestException } from '@nestjs/common';

export function pickFields<T extends string>(body: Record<string, unknown>, fields: readonly T[]): Partial<Record<T, any>> {
  return Object.fromEntries(
    fields
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => [field, normalizeValue(body[field])])
  ) as Partial<Record<T, unknown>>;
}

export function requireFields(body: Record<string, unknown>, fields: readonly string[]) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });
  if (missing.length) {
    throw new BadRequestException(`Missing required fields: ${missing.join(', ')}.`);
  }
}

export function requireEnum<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (!allowed.includes(value as T)) {
    throw new BadRequestException(`${label} must be one of: ${allowed.join(', ')}.`);
  }
  return value as T;
}

export function parseJsonSetting(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new BadRequestException('Setting value must be valid JSON.');
  }
}

function normalizeValue(value: unknown) {
  return value === '' ? null : value;
}
