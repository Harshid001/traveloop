import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../../context/AuthContext';
import { store } from '../../../store';
import { Provider } from 'react-redux';

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
  it('renders FullScreenSpinner while initializing', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});