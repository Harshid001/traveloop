const express = require('express');

const MOCK_USER_ID = 'mock-user-123';

const router = express.Router();

const mockDestinations = [
  { name: "Paris", country: "France", type: "city", image: "https://images.unsplash.com/photo-1529688530641-6c0af6be7f5c", rating: 4.8, estimatedBudget: 3000 },
  { name: "Bali", country: "Indonesia", type: "beach", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", rating: 4.7, estimatedBudget: 2500 },
  { name: "Kyoto", country: "Japan", type: "culture", image: "https://images.unsplash.com/photo-1494598283957-9b6d5e3cf500", rating: 4.9, estimatedBudget: 3500 },
  { name: "Swiss Alps", country: "Switzerland", type: "mountain", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", rating: 4.8, estimatedBudget: 5000 },
  { name: "New York", country: "USA", type: "city", image: "https://images.unsplash.com/photo-1523811268059-43e87ed70cf0", rating: 4.6, estimatedBudget: 4000 },
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockTrips(userId, count = 5) {
  const trips = [];
  for (let i = 0; i < count; i++) {
    const dest = mockDestinations[randInt(0, mockDestinations.length - 1)];
    const start = new Date();
    start.setDate(start.getDate() + randInt(1, 30));
    const end = new Date(start);
    end.setDate(start.getDate() + randInt(3, 14));
    trips.push({
      _id: `mock-trip-${i}`,
      user: userId,
      title: dest.name + " Adventure " + (i + 1),
      destination: dest.name,
      destinations: [dest.name],
      image: dest.image,
      rating: dest.rating,
      estimatedBudget: dest.estimatedBudget,
      startDate: start,
      endDate: end,
    });
  }
  return trips;
}

function getMockExploreData() {
  return mockDestinations.map((d, i) => ({
    id: `mock-explore-${i}`,
    ...d,
    description: `Explore ${d.name} with Traveloop`,
    activities: [],
  }));
}

router.get('/trips', (req, res) => {
  const count = parseInt(req.query.count, 10) || 5;
  const trips = generateMockTrips(MOCK_USER_ID, count);
  res.json({ success: true, data: trips });
});

router.get('/explore', (req, res) => {
  const data = getMockExploreData();
  res.json({ success: true, data });
});

module.exports = router;