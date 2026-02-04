import api from './api';

export const marketIntelligenceAPI = {
  // Get comprehensive market intelligence data
  getMarketIntelligence: async (jobTitle, location) => {
    try {
      const response = await api.get(`/market-intelligence/${encodeURIComponent(jobTitle)}/${encodeURIComponent(location)}`);
      return response.data;
    } catch (error) {
      console.error('Market Intelligence API Error:', error);
      throw error;
    }
  },

  // Get quick market stats
  getMarketStats: async (jobTitle, location = 'United States') => {
    try {
      const response = await api.get(`/market-stats/${encodeURIComponent(jobTitle)}`, {
        params: { location }
      });
      return response.data;
    } catch (error) {
      console.error('Market Stats API Error:', error);
      throw error;
    }
  },

  // Get trending skills for a job title
  getTrendingSkills: async (jobTitle, location = 'United States') => {
    try {
      const response = await api.get(`/trending-skills/${encodeURIComponent(jobTitle)}`, {
        params: { location }
      });
      return response.data;
    } catch (error) {
      console.error('Trending Skills API Error:', error);
      throw error;
    }
  }
};

export default marketIntelligenceAPI;