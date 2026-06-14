/**
 * Traveloop constants — UI-only data for filters, categories, and display.
 * All dynamic destination/trip data now comes from live APIs via api.js.
 *
 * Static destination data is kept ONLY as offline fallback,
 * clearly separated from the UI constants above.
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

// ─── User profile defaults ───────────────────────────────────────────────────
export const DEFAULT_PROFILE = {
  name: 'Traveloop Guest',
  email: 'guest@traveloop.app',
  location: 'India',
  travelStyle: 'Balanced explorer',
};

// ─── Notification defaults ───────────────────────────────────────────────────
export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Welcome to Traveloop!',
    message: 'Start exploring real destinations powered by live travel data.',
    time: 'Just now',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// OFFLINE FALLBACK DATA
// Used ONLY when API is unavailable. Not the primary data source.
// ═══════════════════════════════════════════════════════════════════════════════

export const FALLBACK_DESTINATIONS = [
  {
    id: 'fallback_1',
    name: 'Goa',
    title: 'Goa Beach Escape',
    country: 'India',
    city: 'Goa',
    location: 'Goa, India',
    type: 'beach',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    duration: '4 Days / 3 Nights',
    price: 'INR 12,000',
    budgetAmount: 12000,
    description: 'Sunlit beaches, Portuguese lanes, seafood shacks, and relaxed coastal nights.',
    bestTime: 'November to February',
    activities: ['Baga Beach', 'Old Goa walk', 'Spice plantation', 'Night market'],
    facilities: ['Hotel', 'Meals', 'Guide', 'Transfers'],
    coordinates: { lat: 15.2993, lng: 74.124 },
  },
  {
    id: 'fallback_2',
    name: 'Kyoto',
    title: 'Kyoto Culture Trail',
    country: 'Japan',
    city: 'Kyoto',
    location: 'Kyoto, Japan',
    type: 'cultural',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    duration: '5 Days / 4 Nights',
    price: 'INR 35,000',
    budgetAmount: 35000,
    description: 'Temple gardens, lantern-lit alleys, tea houses, and gentle historic neighborhoods.',
    bestTime: 'March to May',
    activities: ['Fushimi Inari', 'Arashiyama bamboo walk', 'Tea ceremony', 'Gion evening'],
    facilities: ['Hotel', 'Rail pass', 'Breakfast', 'Guide'],
    coordinates: { lat: 35.0116, lng: 135.7681 },
  },
  {
    id: 'fallback_3',
    name: 'Swiss Alps',
    title: 'Swiss Alps Retreat',
    country: 'Switzerland',
    city: 'Interlaken',
    location: 'Interlaken, Switzerland',
    type: 'mountain',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    duration: '6 Days / 5 Nights',
    price: 'INR 50,000',
    budgetAmount: 50000,
    description: 'Snow peaks, blue lakes, scenic trains, and postcard-perfect alpine towns.',
    bestTime: 'December to March',
    activities: ['Jungfrau day trip', 'Lake cruise', 'Village walk', 'Cable car view'],
    facilities: ['Hotel', 'Train tickets', 'Breakfast', 'Insurance'],
    coordinates: { lat: 46.6863, lng: 7.8632 },
  },
  {
    id: 'fallback_4',
    name: 'Bali',
    title: 'Bali Island Reset',
    country: 'Indonesia',
    city: 'Bali',
    location: 'Bali, Indonesia',
    type: 'beach',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    duration: '5 Days / 4 Nights',
    price: 'INR 28,000',
    budgetAmount: 28000,
    description: 'Rice terraces, ocean temples, surf lessons, and slow mornings by the pool.',
    bestTime: 'April to October',
    activities: ['Ubud terraces', 'Uluwatu sunset', 'Surf lesson', 'Spa session'],
    facilities: ['Villa', 'Breakfast', 'Transfers', 'Guide'],
    coordinates: { lat: -8.3405, lng: 115.092 },
  },
  {
    id: 'fallback_5',
    name: 'Dubai',
    title: 'Dubai City Lights',
    country: 'UAE',
    city: 'Dubai',
    location: 'Dubai, UAE',
    type: 'city',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    rating: 4.6,
    duration: '4 Days / 3 Nights',
    price: 'INR 32,000',
    budgetAmount: 32000,
    description: 'Skyline views, desert rides, luxury malls, and a polished city break.',
    bestTime: 'November to March',
    activities: ['Burj Khalifa', 'Desert safari', 'Dhow dinner', 'Marina walk'],
    facilities: ['Hotel', 'Transfers', 'Breakfast', 'Tickets'],
    coordinates: { lat: 25.2048, lng: 55.2708 },
  },
  {
    id: 'fallback_6',
    name: 'Singapore',
    title: 'Singapore Garden City',
    country: 'Singapore',
    city: 'Singapore',
    location: 'Singapore',
    type: 'city',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    duration: '4 Days / 3 Nights',
    price: 'INR 30,000',
    budgetAmount: 30000,
    description: 'Gardens, skyline decks, street food, and polished neighborhoods made for walking.',
    bestTime: 'February to April',
    activities: ['Gardens by the Bay', 'Sentosa', 'Hawker food tour', 'Marina Bay'],
    facilities: ['Hotel', 'Metro card', 'Breakfast', 'Guide'],
    coordinates: { lat: 1.3521, lng: 103.8198 },
  },
];

// Legacy exports for backward compatibility during migration
export const destinations = FALLBACK_DESTINATIONS;
export const featuredTrips = FALLBACK_DESTINATIONS.slice(0, 4);
export const savedTrips = [FALLBACK_DESTINATIONS[0], FALLBACK_DESTINATIONS[2], FALLBACK_DESTINATIONS[4]];

export const myTrips = [
  {
    id: '101',
    title: 'Southeast Asia Trail',
    status: 'active',
    startDate: 'May 5, 2026',
    endDate: 'May 18, 2026',
    destinations: ['Bangkok', 'Bali', 'Singapore'],
    totalBudget: 'INR 1,80,000',
    image: FALLBACK_DESTINATIONS[3].image,
    activities: 10,
  },
  {
    id: '102',
    title: 'Europe Explorer',
    status: 'upcoming',
    startDate: 'Jun 15, 2026',
    endDate: 'Jun 28, 2026',
    destinations: ['Paris', 'Rome', 'Swiss Alps'],
    totalBudget: 'INR 3,40,000',
    image: FALLBACK_DESTINATIONS[2].image,
    activities: 8,
  },
  {
    id: '103',
    title: 'Dubai Weekend',
    status: 'completed',
    startDate: 'Feb 1, 2026',
    endDate: 'Feb 4, 2026',
    destinations: ['Dubai'],
    totalBudget: 'INR 92,000',
    image: FALLBACK_DESTINATIONS[4].image,
    activities: 5,
  },
];

export const notifications = DEFAULT_NOTIFICATIONS;

export const profile = DEFAULT_PROFILE;
