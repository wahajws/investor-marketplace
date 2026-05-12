import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes and verifies passwords', async () => {
    const hash = await service.hash('Password123!');

    expect(hash).toContain('scrypt:');
    await expect(service.verify('Password123!', hash)).resolves.toBe(true);
    await expect(service.verify('WrongPassword123!', hash)).resolves.toBe(false);
  });
});
