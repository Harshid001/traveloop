const Destination = require('../models/Destination');

const SEEDED_SOURCE = 'wikidata';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isSeeded = async () => (await Destination.countDocuments({ source: SEEDED_SOURCE })) > 0;

const toCard = (d) => ({
  id: String(d._id),
  name: d.name,
  city: d.city || d.name,
  country: d.country,
  coordinates: {
    lat: d.location?.lat ?? null,
    lng: d.location?.lng ?? null,
  },
  lat: d.location?.lat ?? null,
  lng: d.location?.lng ?? null,
  type: d.type || 'city',
  image: d.image
    ? { url: d.image, photographer: null, attribution: null }
    : { url: null, photographer: null, attribution: null },
  rating: d.rating ?? null,
  reviewCount: d.reviewCount ?? null,
  estimatedBudget: { min: null, max: null, currency: 'USD' },
  budgetEstimate: null,
  popularity: d.popularity ?? null,
  description: d.description || '',
  activities: d.activities || [],
  tags: d.tags || [],
  source: SEEDED_SOURCE,
});

const search = async (query, limit = 20) => {
  if (!query || !query.trim()) return [];
  const q = query.trim();

  let items = await Destination.find({ $text: { $search: q } }).limit(limit);
  if (!items.length) {
    const regex = new RegExp(escapeRegex(q), 'i');
    items = await Destination.find({
      $or: [{ name: regex }, { city: regex }, { country: regex }],
    }).limit(limit);
  }
  return items;
};

const getById = async (id) => {
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return null;
  return Destination.findById(id).catch(() => null);
};

const getTrending = (limit = 10) =>
  Destination.find({ source: SEEDED_SOURCE }).sort({ popularity: -1 }).limit(limit);

const getRecommended = (limit = 6) =>
  Destination.find({ source: SEEDED_SOURCE }).sort({ popularity: -1 }).limit(limit);

const getByCategory = (type, limit = 6) =>
  Destination.find({ source: SEEDED_SOURCE, type }).sort({ popularity: -1 }).limit(limit);

const getByBudget = (min, max, limit = 10) =>
  Destination.find({
    source: SEEDED_SOURCE,
    'estimatedBudget.budget': { $gte: min, $lte: max },
  })
    .sort({ popularity: -1 })
    .limit(limit);

module.exports = {
  isSeeded,
  toCard,
  search,
  getById,
  getTrending,
  getRecommended,
  getByCategory,
  getByBudget,
};
