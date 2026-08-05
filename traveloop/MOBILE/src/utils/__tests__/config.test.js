const fs = require('fs');
const path = require('path');

describe('Mobile App Infrastructure & Setup Configuration', () => {
  const mobileRoot = path.resolve(__dirname, '../../../');

  it('has tsconfig.json with strict mode enabled', () => {
    const tsconfigPath = path.join(mobileRoot, 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.strictNullChecks).toBe(true);
    expect(tsconfig.compilerOptions.noUnusedLocals).toBe(true);
    expect(tsconfig.compilerOptions.noUnusedParameters).toBe(true);
  });

  it('ensures .env and .env.example keys match if .env exists', () => {
    const envPath = path.join(mobileRoot, '.env');
    const envExamplePath = path.join(mobileRoot, '.env.example');

    expect(fs.existsSync(envExamplePath)).toBe(true);

    if (fs.existsSync(envPath)) {
      const parseEnvKeys = (filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        return content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .map((line) => line.split('=')[0]);
      };

      const envKeys = parseEnvKeys(envPath).sort();
      const exampleKeys = parseEnvKeys(envExamplePath).sort();

      expect(envKeys).toEqual(exampleKeys);
    }
  });
});
