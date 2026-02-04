const express = require('express');
const router = express.Router();
const serperService = require('../services/serperService');

// Get job market intelligence
router.get('/market-intelligence/:jobTitle/:location', async (req, res) => {
  try {
    const { jobTitle, location } = req.params;
    
    if (!jobTitle || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Job title and location are required' 
      });
    }

    console.log(`Fetching market intelligence for ${jobTitle} in ${location}`);
    
    const marketData = await serperService.getJobMarketIntelligence(jobTitle, location);
    
    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Market Intelligence API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market intelligence data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get quick job market stats
router.get('/market-stats/:jobTitle', async (req, res) => {
  try {
    const { jobTitle } = req.params;
    const location = req.query.location || 'United States';
    
    // Quick search for basic stats
    const searchQuery = `${jobTitle} jobs ${location} 2024`;
    const searchResults = await serperService.search(searchQuery, { num: 5 });
    
    const stats = {
      jobTitle,
      location,
      searchResultsCount: searchResults.searchInformation?.totalResults || 'N/A',
      topResult: searchResults.organic?.[0]?.title || 'No results found',
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Market Stats API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get trending skills for a job title
router.get('/trending-skills/:jobTitle', async (req, res) => {
  try {
    const { jobTitle } = req.params;
    const location = req.query.location || 'United States';
    
    const searchQuery = `${jobTitle} required skills trending technologies ${location} 2024`;
    const searchResults = await serperService.search(searchQuery, { num: 10 });
    
    const skills = serperService.extractSkills(searchResults);
    
    res.json({
      success: true,
      data: {
        jobTitle,
        location,
        skills,
        count: skills.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Trending Skills API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending skills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;