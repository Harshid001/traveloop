const unsplashService = require('../services/unsplashService');

const enrichWithImages = async (destinations, options = {}) => {
  if (!destinations || destinations.length === 0) return [];

  const {
    useGetDestinationImages = false,
    fallbackImageUrl = null,
  } = options;

  try {
    const enriched = await Promise.all(
      destinations.map(async (dest) => {
        if (dest.image && typeof dest.image === 'object' && dest.image.url) return dest;

        try {
          if (useGetDestinationImages) {
            const images = await unsplashService.getDestinationImages(dest.name || dest.city, 1);
            const photo = images?.[0];
            const fallbackUrl = fallbackImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format';
            return {
              ...dest,
              image: photo
                ? { url: photo.url?.regular || photo.url, photographer: photo.photographer?.name || '', attribution: photo.attribution || '' }
                : { url: fallbackUrl, photographer: '', attribution: '' },
            };
          }

          const photo = await unsplashService.getRandomPhoto(
            `${dest.name || dest.city} travel`,
            'landscape'
          );
          return {
            ...dest,
            image: {
              url: photo?.url || photo?.urls?.regular || null,
              photographer: photo?.photographer || photo?.user?.name || null,
              attribution: photo?.attribution || photo?.links?.html || null,
            },
          };
        } catch (err) {
          console.error('enrichWithImages: unsplash fetch failed for', dest.name || dest.city, err.message);
          if (fallbackImageUrl) {
            return { ...dest, image: { url: fallbackImageUrl, photographer: '', attribution: '' } };
          }
          return dest;
        }
      })
    );
    return enriched;
  } catch (err) {
    console.error('enrichWithImages: batch enrichment failed:', err.message);
    return destinations;
  }
};

module.exports = enrichWithImages;