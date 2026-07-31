import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../../context/AuthContext';
import { store } from '../../../store';
import { Provider } from 'react-redux';
import { authApi } from '../../../services/api';

vi.spyOn(authApi, 'me').mockImplementation(() => new Promise(() => {}));

function renderWithProviders(ui, { initialEntries = ['/'] } = {}) {
  return render(
    <Provider store={store}>
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </Provider>
  );
}

describe('ProtectedRoute', () => {
  it('renders FullScreenSpinner while initializing', async () => {
    await act(async () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
    });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});