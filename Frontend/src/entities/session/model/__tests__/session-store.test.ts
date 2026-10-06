jest.mock('@/shared/lib/storage', () => ({
  getStoredItem: jest.fn(async () => null),
  setStoredItem: jest.fn(async () => undefined),
  removeStoredItem: jest.fn(async () => undefined),
}));

import { useSessionStore } from '../session-store';

describe('When the session signs in and out', () => {
  it('should move between authenticated and anonymous', async () => {
    await useSessionStore.getState().signIn('jwt-token', 'user-1');
    expect(useSessionStore.getState()).toEqual(
      expect.objectContaining({ status: 'authenticated', token: 'jwt-token', userId: 'user-1' }),
    );

    await useSessionStore.getState().signOut();
    expect(useSessionStore.getState()).toEqual(
      expect.objectContaining({ status: 'anonymous', token: null, userId: null }),
    );
  });
});
