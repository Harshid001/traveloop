import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

function BrokenComponent() {
  throw new Error('Test crash');
}

function renderWithSuppressedError(ui) {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const result = render(ui);
  spy.mockRestore();
  return result;
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders fallback when child throws', () => {
    renderWithSuppressedError(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    renderWithSuppressedError(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });
});