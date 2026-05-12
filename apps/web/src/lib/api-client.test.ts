import { describe, expect, it } from 'vitest';
import { ApiClientError } from './api-client';

describe('ApiClientError', () => {
  it('normalizes API error payloads', () => {
    const error = new ApiClientError({
      code: 'NOT_FOUND',
      message: 'Company not found.',
      details: { companyId: '123' }
    });

    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Company not found.');
    expect(error.details).toEqual({ companyId: '123' });
  });
});
