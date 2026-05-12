/* ===== 12 Famous Destinations with full data ===== */
export const destinations = [
  {
    id: 1, name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'The City of Light captivates with iconic landmarks, world-class cuisine, and romantic charm.',
    rating: 4.8, budgetEstimate: 2500,
    activities: [
      { name: 'Eiffel Tower Visit', category: 'Sightseeing', cost: 30, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=400&q=80' },
      { name: 'Louvre Museum', category: 'Museum', cost: 20, duration: '4 hrs', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80' },
      { name: 'Seine River Cruise', category: 'Sightseeing', cost: 15, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1471623432079-b009d30b6729?auto=format&fit=crop&w=400&q=80' },
      { name: 'French Cooking Class', category: 'Food Tour', cost: 85, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 2, name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    description: 'A dazzling blend of ultramodern technology and ancient temples in a vibrant metropolis.',
    rating: 4.9, budgetEstimate: 3200,
    activities: [
      { name: 'Shibuya Crossing', category: 'Sightseeing', cost: 0, duration: '1 hr', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80' },
      { name: 'Tsukiji Fish Market', category: 'Food Tour', cost: 40, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80' },
      { name: 'Senso-ji Temple', category: 'Sightseeing', cost: 0, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?auto=format&fit=crop&w=400&q=80' },
      { name: 'Akihabara Tech Tour', category: 'Shopping', cost: 50, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1528164344885-47b1492b7386?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 3, name: 'Bali', country: 'Indonesia', lat: -8.3405, lng: 115.0920,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Tropical paradise with stunning rice terraces, sacred temples, and pristine beaches.',
    rating: 4.7, budgetEstimate: 1800,
    activities: [
      { name: 'Tegallalang Rice Terrace', category: 'Sightseeing', cost: 10, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1531592937781-2a5c40e5c7e9?auto=format&fit=crop&w=400&q=80' },
      { name: 'Uluwatu Temple Sunset', category: 'Sightseeing', cost: 5, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=400&q=80' },
      { name: 'Surfing Lesson', category: 'Adventure', cost: 35, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1502680390548-bdbac40e4a78?auto=format&fit=crop&w=400&q=80' },
      { name: 'Balinese Spa', category: 'Wellness', cost: 25, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 4, name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    description: 'Futuristic skyline, luxury shopping, and desert adventures in the Middle East gem.',
    rating: 4.6, budgetEstimate: 3500,
    activities: [
      { name: 'Burj Khalifa Observatory', category: 'Sightseeing', cost: 45, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=400&q=80' },
      { name: 'Desert Safari', category: 'Adventure', cost: 70, duration: '6 hrs', image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=400&q=80' },
      { name: 'Dubai Mall & Fountain', category: 'Shopping', cost: 0, duration: '4 hrs', image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=400&q=80' },
      { name: 'Dhow Cruise Dinner', category: 'Food Tour', cost: 55, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 5, name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198,
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    description: 'The Lion City — a futuristic garden city with incredible food and cultural fusion.',
    rating: 4.7, budgetEstimate: 2800,
    activities: [
      { name: 'Gardens by the Bay', category: 'Sightseeing', cost: 20, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=400&q=80' },
      { name: 'Marina Bay Sands', category: 'Sightseeing', cost: 25, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?auto=format&fit=crop&w=400&q=80' },
      { name: 'Hawker Centre Food Tour', category: 'Food Tour', cost: 15, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=400&q=80' },
      { name: 'Sentosa Island', category: 'Beach', cost: 30, duration: '5 hrs', image: 'https://images.unsplash.com/photo-1570789210967-2cac24db7ce9?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 6, name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    description: 'The city that never sleeps — Broadway, Central Park, and iconic skyline views.',
    rating: 4.5, budgetEstimate: 4000,
    activities: [
      { name: 'Statue of Liberty', category: 'Sightseeing', cost: 25, duration: '4 hrs', image: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=400&q=80' },
      { name: 'Central Park Walk', category: 'Sightseeing', cost: 0, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?auto=format&fit=crop&w=400&q=80' },
      { name: 'Broadway Show', category: 'Nightlife', cost: 120, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=400&q=80' },
      { name: 'Times Square Night', category: 'Nightlife', cost: 0, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 7, name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964,
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    description: 'Eternal city of ancient ruins, Renaissance art, and the world\'s best pasta.',
    rating: 4.8, budgetEstimate: 2200,
    activities: [
      { name: 'Colosseum Tour', category: 'Sightseeing', cost: 20, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' },
      { name: 'Vatican Museums', category: 'Museum', cost: 18, duration: '4 hrs', image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=400&q=80' },
      { name: 'Trevi Fountain', category: 'Sightseeing', cost: 0, duration: '1 hr', image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=400&q=80' },
      { name: 'Roman Food Walk', category: 'Food Tour', cost: 60, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 8, name: 'Switzerland', country: 'Switzerland', lat: 46.8182, lng: 8.2275,
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    description: 'Alpine wonderland with pristine lakes, chocolate, and breathtaking mountain views.',
    rating: 4.9, budgetEstimate: 4500,
    activities: [
      { name: 'Jungfrau Peak', category: 'Adventure', cost: 100, duration: '6 hrs', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=400&q=80' },
      { name: 'Lake Lucerne Cruise', category: 'Sightseeing', cost: 40, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=400&q=80' },
      { name: 'Chocolate Factory Tour', category: 'Food Tour', cost: 25, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=400&q=80' },
      { name: 'Paragliding Interlaken', category: 'Adventure', cost: 150, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 9, name: 'Maldives', country: 'Maldives', lat: 3.2028, lng: 73.2207,
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
    description: 'Crystal-clear waters, overwater villas, and the ultimate tropical escape.',
    rating: 4.9, budgetEstimate: 5000,
    activities: [
      { name: 'Snorkeling Reef', category: 'Adventure', cost: 45, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80' },
      { name: 'Sunset Dolphin Cruise', category: 'Sightseeing', cost: 60, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=400&q=80' },
      { name: 'Private Beach Dinner', category: 'Food Tour', cost: 120, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=400&q=80' },
      { name: 'Scuba Diving', category: 'Adventure', cost: 90, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 10, name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018,
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant street life, ornate temples, and legendary street food paradise.',
    rating: 4.4, budgetEstimate: 1200,
    activities: [
      { name: 'Grand Palace Tour', category: 'Sightseeing', cost: 15, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=400&q=80' },
      { name: 'Street Food Crawl', category: 'Food Tour', cost: 10, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
      { name: 'Floating Market', category: 'Shopping', cost: 20, duration: '4 hrs', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=400&q=80' },
      { name: 'Thai Massage', category: 'Wellness', cost: 12, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 11, name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278,
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    description: 'Historic royalty, world-class museums, and vibrant multicultural neighborhoods.',
    rating: 4.6, budgetEstimate: 3800,
    activities: [
      { name: 'Tower of London', category: 'Sightseeing', cost: 30, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=400&q=80' },
      { name: 'British Museum', category: 'Museum', cost: 0, duration: '4 hrs', image: 'https://images.unsplash.com/photo-1575223970966-76ae61ee7838?auto=format&fit=crop&w=400&q=80' },
      { name: 'London Eye', category: 'Sightseeing', cost: 35, duration: '1 hr', image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=400&q=80' },
      { name: 'West End Show', category: 'Nightlife', cost: 80, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 12, name: 'Goa', country: 'India', lat: 15.2993, lng: 74.1240,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    description: 'Sun-kissed beaches, Portuguese heritage, and India\'s ultimate party destination.',
    rating: 4.3, budgetEstimate: 800,
    activities: [
      { name: 'Baga Beach', category: 'Beach', cost: 0, duration: '4 hrs', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
      { name: 'Old Goa Churches', category: 'Sightseeing', cost: 0, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80' },
      { name: 'Spice Plantation', category: 'Sightseeing', cost: 10, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80' },
      { name: 'Night Market', category: 'Shopping', cost: 5, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80' },
    ],
  },
];

/* ===== Top Trips (for carousel) ===== */
export const topTrips = destinations.slice(0, 5).map((d) => ({
  id: d.id, title: `${d.name} Getaway`, location: `${d.name}, ${d.country}`,
  image: d.image, rating: d.rating, duration: `${Math.floor(Math.random() * 5) + 3} Days / ${Math.floor(Math.random() * 5) + 2} Nights`,
  price: `$${d.budgetEstimate.toLocaleString()}`, budget: `$${d.budgetEstimate.toLocaleString()}`,
  description: d.description, facilities: ['Hotel', 'Flights', 'Meals', 'Guide', 'Insurance'],
  activities: d.activities.map((a) => a.name),
}));

/* ===== Latest Trips (for grid) ===== */
export const latestTrips = destinations.slice(5).map((d) => ({
  id: d.id, title: `${d.name} Adventure`, location: `${d.name}, ${d.country}`,
  image: d.image, rating: d.rating, duration: `${Math.floor(Math.random() * 5) + 3} Days / ${Math.floor(Math.random() * 5) + 2} Nights`,
  price: `$${d.budgetEstimate.toLocaleString()}`, budget: `$${d.budgetEstimate.toLocaleString()}`,
  description: d.description, facilities: ['Hotel', 'Flights', 'Meals', 'Guide', 'Insurance'],
  activities: d.activities.map((a) => a.name),
}));

/* ===== Demo My Trips ===== */
export const demoMyTrips = [
  { id: 101, title: 'Europe Explorer', status: 'upcoming', startDate: 'Jun 15, 2026', endDate: 'Jun 28, 2026',
    destinations: ['Paris', 'Rome', 'Switzerland'], totalBudget: 9200, image: destinations[0].image,
    activities: 8, distance: '2,400 km' },
  { id: 102, title: 'Southeast Asia Trail', status: 'active', startDate: 'May 5, 2026', endDate: 'May 18, 2026',
    destinations: ['Bangkok', 'Bali', 'Singapore'], totalBudget: 5800, image: destinations[9].image,
    activities: 10, distance: '4,100 km' },
  { id: 103, title: 'Dubai & Maldives Luxury', status: 'completed', startDate: 'Feb 1, 2026', endDate: 'Feb 10, 2026',
    destinations: ['Dubai', 'Maldives'], totalBudget: 8500, image: destinations[3].image,
    activities: 6, distance: '3,600 km' },
];
