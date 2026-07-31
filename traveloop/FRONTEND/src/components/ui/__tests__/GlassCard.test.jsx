import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlassCard from '../GlassCard';

describe('GlassCard', () => {
  it('renders children inside glass-card class', () => {
    render(<GlassCard><span>Content</span></GlassCard>);
    const card = screen.getByText('Content').parentElement;
    expect(card.className).toContain('glass-card');
  });

  it('merges custom className', () => {
    render(<GlassCard className="custom"><span>Content</span></GlassCard>);
    const card = screen.getByText('Content').parentElement;
    expect(card.className).toContain('custom');
  });
});