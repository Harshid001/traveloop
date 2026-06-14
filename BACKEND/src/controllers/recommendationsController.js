/**
 * Recommendations controller for Traveloop.
 * Exposes personalized, similar, seasonal, and AI-powered recommendation endpoints.
 */

const recommendationService = require('../services/recommendationService');
const SearchHistory = require('../models/SearchHistory');
const UserPreference = require('../models/UserPreference');

/**
 * GET /api/recommendations/personalized
 * Get personalized recommendations based on user behavior.
 */
const getPersonalized = async (req, res) => {
  try {
    const userId = req.user?.id || 'anonymous';

    // Gather user signals
    let signals = { favoriteCategories: ['beach', 'city', 'mountain'] };

    try {
      const [preferences, history] = await Promise.allSettled([
        UserPreference.findOne({ userId }),
        SearchHistory.find({ userId }).sort({ createdAt: -1 }).limit(20),
      ]);

      if (preferences.status === 'fulfilled' && preferences.value) {
        signals = {
          favoriteCategories: preferences.value.favoriteCategories || signals.favoriteCategories,
          budgetRange: preferences.value.budgetRange || null,
          travelStyle: preferences.value.travelStyle || '',
        };
      }

      if (history.status === 'fulfilled' && history.value?.length > 0) {
        // Extract categories from search history
        const historyCats = history.value
          .filter((h) => h.category)
          .map((h) => h.category);
        if (historyCats.length > 0) {
          signals.favoriteCategories = [...new Set([...historyCats, ...signals.favoriteCategories])].slice(0, 5);
        }
      }
    } catch (err) {
      console.warn('Failed to load user signals:', err.message);
    }

    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, signals);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Personalized recommendations error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get recommendations' });
  }
};

/**
 * GET /api/recommendations/similar/:destinationId
 * Get destinations similar to the given one.
 */
const getSimilar = async (req, res) => {
  try {
    const { destinationId } = req.params;

    if (!destinationId) {
      return res.status(400).json({ success: false, message: 'Destination ID required' });
    }

    // Try to load the source destination
    let destination = { name: destinationId, type: '' };
    try {
      const Destination = require('../models/Destination');
      const found = await Destination.findById(destinationId);
      if (found) destination = found;
    } catch {
      // Use the ID as a name fallback
    }

    const similar = await recommendationService.getSimilarDestinations(destination);
    res.status(200).json({ success: true, data: similar });
  } catch (error) {
    console.error('Similar destinations error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get similar destinations' });
  }
};

/**
 * GET /api/recommendations/trending
 * Get trending destinations.
 */
const getTrending = async (req, res) => {
  try {
    const recommendations = await recommendationService.getPersonalizedRecommendations('trending', {
      favoriteCategories: ['beach', 'city', 'cultural', 'mountain'],
    });
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Trending recommendations error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get trending destinations' });
  }
};

/**
 * GET /api/recommendations/seasonal
 * Get seasonal recommendations for current or specified month.
 */
const getSeasonal = async (req, res) => {
  try {
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
    const recommendations = await recommendationService.getSeasonalRecommendations(month);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Seasonal recommendations error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get seasonal recommendations' });
  }
};

/**
 * POST /api/recommendations/ai-suggest
 * AI-powered suggestion from natural language query.
 */
const aiSuggest = async (req, res) => {
  try {
    const { query, preferences } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const suggestions = await recommendationService.getAiSuggestions(query, preferences || {});
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error('AI suggest error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get AI suggestions' });
  }
};

module.exports = {
  getPersonalized,
  getSimilar,
  getTrending,
  getSeasonal,
  aiSuggest,
};
