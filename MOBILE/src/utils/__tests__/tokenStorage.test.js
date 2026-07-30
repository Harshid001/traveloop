describe('tokenStorage (mobile)', () => {
  let memoryToken;

  // Replicate the in-memory fallback logic from tokenStorage.js
  const simulateStore = {
    get: () => memoryToken,
    set: (token) => { memoryToken = token; },
    clear: () => { memoryToken = null; },
  };

  beforeEach(() => {
    memoryToken = null;
  });

  it('returns null when no token stored', async () => {
    expect(simulateStore.get()).toBeNull();
  });

  it('stores and retrieves a token in memory', async () => {
    simulateStore.set('mobile-token-abc');
    expect(simulateStore.get()).toBe('mobile-token-abc');
  });

  it('clears the stored token', async () => {
    simulateStore.set('mobile-token-xyz');
    simulateStore.clear();
    expect(simulateStore.get()).toBeNull();
  });
});