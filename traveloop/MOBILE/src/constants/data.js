/**
 * Traveloop constants — UI-only data for filters, categories, and display.
 * All dynamic destination/trip data now comes from live APIs via api.js.
 */

// ─── Categories (used for filter chips) ─────────────────────────────────────
export const categories = [
  { id: 'all', label: 'All', type: 'all', emoji: '🌍' },
  { id: 'beach', label: 'Beaches', type: 'beach', emoji: '🏖️' },
  { id: 'mountain', label: 'Mountains', type: 'mountain', emoji: '🏔️' },
  { id: 'city', label: 'Cities', type: 'city', emoji: '🏙️' },
  { id: 'cultural', label: 'Cultural', type: 'cultural', emoji: '🏛️' },
  { id: 'adventure', label: 'Adventure', type: 'adventure', emoji: '🧗' },
  { id: 'nature', label: 'Nature', type: 'nature', emoji: '🌿' },
  { id: 'historical', label: 'Historical', type: 'historical', emoji: '🏰' },
  { id: 'island', label: 'Islands', type: 'island', emoji: '🏝️' },
  { id: 'luxury', label: 'Luxury', type: 'luxury', emoji: '💎' },
  { id: 'budget', label: 'Budget', type: 'budget', emoji: '💰' },
  { id: 'family', label: 'Family', type: 'family', emoji: '👨‍👩‍👧‍👦' },
  { id: 'solo', label: 'Solo', type: 'solo', emoji: '🎒' },
  { id: 'couples', label: 'Couples', type: 'couples', emoji: '💑' },
  { id: 'food', label: 'Food', type: 'food', emoji: '🍜' },
];

// ─── Travel moods / Explore-by-mood chips ────────────────────────────────────
export const travelMoods = [
  { id: 'relax', label: 'Relaxation', emoji: '🧘' },
  { id: 'adventure', label: 'Adventure', emoji: '⛰️' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'romance', label: 'Romance', emoji: '❤️' },
  { id: 'party', label: 'Nightlife', emoji: '🎉' },
  { id: 'family', label: 'Family Fun', emoji: '👨‍👩‍👧' },
  { id: 'wellness', label: 'Wellness', emoji: '🌺' },
  { id: 'foodie', label: 'Foodie', emoji: '🍜' },
];

// ─── Destination types enum ──────────────────────────────────────────────────
export const DESTINATION_TYPES = [
  'beach', 'mountain', 'city', 'cultural', 'historical',
  'island', 'adventure', 'nature', 'luxury', 'desert', 'lake',
];

// ─── Budget ranges for filtering ─────────────────────────────────────────────
export const BUDGET_RANGES = [
  { id: 'budget', label: 'Budget', min: 0, max: 500, emoji: '💰' },
  { id: 'mid', label: 'Mid-Range', min: 500, max: 2000, emoji: '💵' },
  { id: 'luxury', label: 'Luxury', min: 2000, max: 10000, emoji: '💎' },
  { id: 'ultra', label: 'Ultra Luxury', min: 10000, max: 100000, emoji: '👑' },
];

// ─── Seasons ─────────────────────────────────────────────────────────────────
export const SEASONS = [
  { id: 'spring', label: 'Spring', months: [3, 4, 5], emoji: '🌸' },
  { id: 'summer', label: 'Summer', months: [6, 7, 8], emoji: '☀️' },
  { id: 'fall', label: 'Fall', months: [9, 10, 11], emoji: '🍂' },
  { id: 'winter', label: 'Winter', months: [12, 1, 2], emoji: '❄️' },
];

// ─── Sort options for Explore screen ─────────────────────────────────────────
export const SORT_OPTIONS = [
  { id: 'popular', label: 'Popular', sortField: 'popularity', order: 'desc' },
  { id: 'rating', label: 'Top Rated', sortField: 'rating', order: 'desc' },
  { id: 'budget_low', label: 'Budget: Low→High', sortField: 'budgetEstimate', order: 'asc' },
  { id: 'budget_high', label: 'Budget: High→Low', sortField: 'budgetEstimate', order: 'desc' },
  { id: 'duration_short', label: 'Short Trips', sortField: 'duration', order: 'asc' },
];

// ─── Travel styles (used in CreateTrip) ──────────────────────────────────────
export const TRAVEL_STYLES = [
  { id: 'solo', label: 'Solo', emoji: '🎒' },
  { id: 'couple', label: 'Couple', emoji: '💑' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 'friends', label: 'Friends', emoji: '👯' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'adventure', label: 'Adventure', emoji: '🧗' },
  { id: 'luxury', label: 'Luxury', emoji: '💎' },
  { id: 'budget', label: 'Budget', emoji: '💰' },
];
