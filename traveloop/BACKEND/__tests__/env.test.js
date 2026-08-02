const path = require('path');
const fs = require('fs');

const DANGEROUS_PLACEHOLDERS = [
  'change_this_secret_in_production',
  'change_this_in_production_use_a_strong_random_secret',
  'your_jwt_secret_here',
  'your-secret-key',
];

describe('Environment Configuration', () => {
  test('.env exists and has no dangerous default secrets', () => {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      const examplePath = path.join(__dirname, '..', '.env.example');
      expect(fs.existsSync(examplePath)).toBe(true);
      return;
    }
    const content = fs.readFileSync(envPath, 'utf-8');

    for (const placeholder of DANGEROUS_PLACEHOLDERS) {
      expect(content).not.toContain(placeholder);
    }
  });

  test('.env.example exists for documentation', () => {
    const examplePath = path.join(__dirname, '..', '.env.example');
    expect(fs.existsSync(examplePath)).toBe(true);
  });

  test('.env is gitignored', () => {
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignore).toContain('.env');
  });

  test('validateEnv throws on placeholder JWT secrets', () => {
    const { env, validateEnv } = require('../src/config/env');
    const original = env.JWT_SECRET;
    env.JWT_SECRET = 'change_this_secret_in_production';
    expect(() => validateEnv()).toThrow(/JWT_SECRET is using a placeholder/);
    env.JWT_SECRET = original;
  });
});