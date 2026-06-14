import axios from 'axios';

// Mock data structures to simulate real APIs until keys are provided

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getTrendingDestinations = async () => {
  await delay(800);
  return [
    {
      id: '1',
      name: 'Bali',
      country: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
      rating: 4.8,
      estimatedBudget: 1200,
      weather: '28°C',
      tags: ['Beaches', 'Culture', 'Relaxation'],
    },
    {
      id: '2',
      name: 'Kyoto',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
      rating: 4.9,
      estimatedBudget: 2500,
      weather: '18°C',
      tags: ['Historical', 'Culture', 'Nature'],
    },
    {
      id: '3',
      name: 'Santorini',
      country: 'Greece',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e',
      rating: 4.7,
      estimatedBudget: 3000,
      weather: '25°C',
      tags: ['Luxury', 'Couples', 'Beaches'],
    },
    {
      id: '4',
      name: 'Reykjavik',
      country: 'Iceland',
      image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae',
      rating: 4.6,
      estimatedBudget: 3500,
      weather: '5°C',
      tags: ['Adventure', 'Nature', 'Cold'],
    }
  ];
};

export const getSeasonalRecommendations = async () => {
  await delay(700);
  return [
    {
      id: '5',
      name: 'Amalfi Coast',
      country: 'Italy',
      image: 'https://images.unsplash.com/photo-1633519895089-8b835fffa388',
      rating: 4.8,
      estimatedBudget: 4000,
      weather: '24°C',
      tags: ['Summer', 'Luxury', 'Views'],
    },
    {
      id: '6',
      name: 'Swiss Alps',
      country: 'Switzerland',
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7',
      rating: 4.9,
      estimatedBudget: 5000,
      weather: '-2°C',
      tags: ['Winter', 'Adventure', 'Mountains'],
    }
  ];
};

export const getDestinationDetails = async (id) => {
  await delay(1000);
  return {
    id: id,
    name: 'Santorini',
    country: 'Greece',
    images: [
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5f1',
      'https://images.unsplash.com/photo-1601581875039-e899893d520c',
    ],
    description: 'Santorini is one of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC, forever shaping its rugged landscape. The whitewashed, cubiform houses of its 2 principal towns, Fira and Oia, cling to cliffs above an underwater caldera (crater).',
    rating: 4.7,
    reviewsCount: 12450,
    weather: {
      temp: '25°C',
      condition: 'Sunny',
      bestMonths: ['May', 'Jun', 'Sep', 'Oct'],
    },
    activities: [
      { id: 'a1', name: 'Catamaran Cruise', price: 150 },
      { id: 'a2', name: 'Wine Tasting Tour', price: 85 },
      { id: 'a3', name: 'Oia Sunset Walk', price: 0 },
    ],
    baseBudget: {
      flights: 800,
      hotelPerNight: 250,
      foodPerDay: 80,
    }
  };
};

export const searchDestinations = async (query) => {
  await delay(600);
  // Simple mock search
  const all = [...await getTrendingDestinations(), ...await getSeasonalRecommendations()];
  if (!query) return all;
  return all.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.country.toLowerCase().includes(query.toLowerCase()));
};

// ---------------------------------------------------------
// Added back missing mock exports to prevent app crashes
// ---------------------------------------------------------
export const hydrateAuthToken = async () => 'mock-token';
export const persistAuthToken = async (token) => {};

export const authApi = {
  login: async () => ({ token: 'mock-token' }),
  register: async () => ({ token: 'mock-token' }),
};

export const bookingsApi = {};
export const tripsApi = {
  getTrips: async () => [],
};
export const chatbotApi = {};
export const journalApi = {};
export const notificationsApi = {};
export const wishlistApi = {
  saveWishlistItem: async () => {},
};
export const imagesApi = {
  destination: async () => [],
};
export const placesApi = {
  nearby: async () => [],
  details: async () => null,
  autocomplete: async () => [],
};
