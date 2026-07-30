const UNSPLASH_BASE = 'https://images.unsplash.com';

export function optimizeImageUrl(url, { width = 400, quality = 80, format = 'webp' } = {}) {
  if (!url) return url;
  if (url.includes('unsplash.com')) {
    const base = url.split('?')[0];
    const params = new URLSearchParams();
    params.set('auto', 'format');
    params.set('fit', 'crop');
    params.set('w', String(width));
    params.set('q', String(quality));
    if (format === 'webp') {
      params.set('fm', 'webp');
    }
    return `${base}?${params.toString()}`;
  }
  return url;
}

export function srcSet(url, widths = [400, 800, 1200]) {
  if (!url || !url.includes('unsplash.com')) return undefined;
  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}

export const DEFAULT_TRAVEL_IMAGE = `${UNSPLASH_BASE}/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80`;