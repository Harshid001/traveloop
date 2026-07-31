import { describe, it, expect } from 'vitest';
import { optimizeImageUrl, srcSet, DEFAULT_TRAVEL_IMAGE } from '../imageUrl';

describe('optimizeImageUrl', () => {
  it('returns undefined for falsy input', () => {
    expect(optimizeImageUrl('')).toBe('');
    expect(optimizeImageUrl(null)).toBe(null);
  });

  it('adds width and quality params to unsplash URLs', () => {
    const url = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34';
    const result = optimizeImageUrl(url, { width: 400, quality: 80 });
    expect(result).toContain('w=400');
    expect(result).toContain('q=80');
    expect(result).toContain('auto=format');
    expect(result).toContain('fit=crop');
  });

  it('adds WebP format by default', () => {
    const url = 'https://images.unsplash.com/photo-test';
    const result = optimizeImageUrl(url);
    expect(result).toContain('fm=webp');
  });

  it('does not modify non-unsplash URLs', () => {
    const url = 'https://example.com/image.jpg';
    expect(optimizeImageUrl(url)).toBe(url);
  });

  it('DEFAULT_TRAVEL_IMAGE is a valid unsplash URL', () => {
    expect(DEFAULT_TRAVEL_IMAGE).toContain('images.unsplash.com');
  });
});

describe('srcSet', () => {
  it('returns srcSet string with multiple widths', () => {
    const url = 'https://images.unsplash.com/photo-test';
    const result = srcSet(url, [400, 800]);
    expect(result).toContain('400w');
    expect(result).toContain('800w');
  });

  it('returns undefined for non-unsplash URLs', () => {
    expect(srcSet('https://example.com/img.jpg')).toBeUndefined();
  });
});