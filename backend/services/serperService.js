const axios = require('axios');

class SerperService {
  constructor() {
    this.apiKey = process.env.SERPER_API_KEY;
    this.baseURL = 'https://google.serper.dev';
  }

  async search(query, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/search`, {
        q: query,
        num: options.num || 10,
        gl: options.country || 'us'
      }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Serper API Error:', error.message);
      throw new Error('Failed to fetch search results');
    }
  }

  async getJobMarketIntelligence(jobTitle, location) {
    try {
      const queries = [
        `${jobTitle} average salary ${location} 2024`,
        `${jobTitle} job demand trends ${location}`,
        `top companies hiring ${jobTitle} ${location}`,
        `${jobTitle} skills requirements 2024`,
        `remote ${jobTitle} jobs statistics`
      ];

      const results = await Promise.all(
        queries.map(query => this.search(query, { num: 5 }))
      );

      return {
        salaryData: this.extractSalaryTrends(results[0]),
        demandTrends: this.analyzeDemand(results[1]),
        topEmployers: this.extractCompanies(results[2]),
        skillRequirements: this.extractSkills(results[3]),
        remoteOpportunities: this.analyzeRemoteData(results[4]),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market Intelligence Error:', error.message);
      throw error;
    }
  }

  extractSalaryTrends(searchResults) {
    if (!searchResults.organic) return { average: 'N/A', trend: 'stable', range: 'N/A' };
    
    const salaryRegex = /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)[kK]?/g;
    const salaries = [];
    
    searchResults.organic.forEach(result => {
      const text = `${result.title} ${result.snippet}`;
      let match;
      while ((match = salaryRegex.exec(text)) !== null) {
        const salary = parseInt(match[1].replace(/,/g, ''));
        if (salary > 20 && salary < 500) { // Assume it's in thousands
          salaries.push(salary * 1000);
        } else if (salary >= 20000 && salary <= 500000) {
          salaries.push(salary);
        }
      }
    });

    if (salaries.length === 0) {
      return { average: 'N/A', trend: 'stable', range: 'N/A' };
    }

    const average = Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);
    const min = Math.min(...salaries);
    const max = Math.max(...salaries);
    
    return {
      average: `$${average.toLocaleString()}`,
      range: `$${min.toLocaleString()} - $${max.toLocaleString()}`,
      trend: this.determineTrend(searchResults),
      dataPoints: salaries.length
    };
  }

  analyzeDemand(searchResults) {
    if (!searchResults.organic) return { level: 'moderate', growth: 'stable', openings: 'N/A' };
    
    const demandKeywords = {
      high: ['high demand', 'urgent hiring', 'shortage', 'growing field', 'expanding'],
      moderate: ['steady demand', 'consistent', 'stable'],
      low: ['declining', 'saturated', 'competitive market', 'limited openings']
    };

    let demandScore = 0;
    const searchText = searchResults.organic.map(r => `${r.title} ${r.snippet}`).join(' ').toLowerCase();
    
    Object.entries(demandKeywords).forEach(([level, keywords]) => {
      keywords.forEach(keyword => {
        if (searchText.includes(keyword)) {
          demandScore += level === 'high' ? 3 : level === 'moderate' ? 1 : -1;
        }
      });
    });

    const level = demandScore > 2 ? 'high' : demandScore < -1 ? 'low' : 'moderate';
    
    return {
      level,
      growth: demandScore > 0 ? 'growing' : 'stable',
      confidence: Math.min(100, Math.max(60, 60 + Math.abs(demandScore) * 10))
    };
  }

  extractCompanies(searchResults) {
    if (!searchResults.organic) return [];
    
    const companies = new Set();
    const companyPatterns = [
      /(?:at|join|work for|hiring at)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd)?)/gi,
      /([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Company))\s+(?:is hiring|jobs|careers)/gi
    ];
    
    searchResults.organic.forEach(result => {
      const text = `${result.title} ${result.snippet}`;
      companyPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const company = match[1].trim();
          if (company.length > 2 && company.length < 50) {
            companies.add(company);
          }
        }
      });
    });

    return Array.from(companies).slice(0, 10);
  }

  extractSkills(searchResults) {
    if (!searchResults.organic) return [];
    
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
      'SQL', 'MongoDB', 'TypeScript', 'Angular', 'Vue.js', 'Git', 'Agile', 'Scrum',
      'Machine Learning', 'AI', 'Data Analysis', 'Project Management', 'Leadership',
      'Communication', 'Problem Solving', 'Teamwork', 'HTML', 'CSS', 'REST API',
      'GraphQL', 'Redux', 'Express', 'Spring Boot', 'Django', 'Flask', 'Laravel'
    ];
    
    const foundSkills = new Set();
    const searchText = searchResults.organic.map(r => `${r.title} ${r.snippet}`).join(' ');
    
    skillKeywords.forEach(skill => {
      if (searchText.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    });

    return Array.from(foundSkills).slice(0, 15);
  }

  analyzeRemoteData(searchResults) {
    if (!searchResults.organic) return { percentage: 'N/A', trend: 'stable' };
    
    const searchText = searchResults.organic.map(r => `${r.title} ${r.snippet}`).join(' ').toLowerCase();
    const remoteKeywords = ['remote', 'work from home', 'wfh', 'distributed', 'virtual'];
    const totalKeywords = ['jobs', 'positions', 'openings', 'roles'];
    
    let remoteCount = 0;
    let totalCount = 0;
    
    remoteKeywords.forEach(keyword => {
      const matches = (searchText.match(new RegExp(keyword, 'g')) || []).length;
      remoteCount += matches;
    });
    
    totalKeywords.forEach(keyword => {
      const matches = (searchText.match(new RegExp(keyword, 'g')) || []).length;
      totalCount += matches;
    });
    
    const percentage = totalCount > 0 ? Math.round((remoteCount / totalCount) * 100) : 25;
    
    return {
      percentage: Math.min(100, Math.max(10, percentage)),
      trend: percentage > 30 ? 'increasing' : 'stable',
      availability: percentage > 50 ? 'high' : percentage > 25 ? 'moderate' : 'limited'
    };
  }

  determineTrend(searchResults) {
    const searchText = searchResults.organic.map(r => `${r.title} ${r.snippet}`).join(' ').toLowerCase();
    const positiveKeywords = ['increasing', 'rising', 'growing', 'upward', 'boom'];
    const negativeKeywords = ['decreasing', 'falling', 'declining', 'downward', 'shrinking'];
    
    const positiveCount = positiveKeywords.reduce((count, keyword) => 
      count + (searchText.match(new RegExp(keyword, 'g')) || []).length, 0
    );
    
    const negativeCount = negativeKeywords.reduce((count, keyword) => 
      count + (searchText.match(new RegExp(keyword, 'g')) || []).length, 0
    );
    
    if (positiveCount > negativeCount) return 'increasing';
    if (negativeCount > positiveCount) return 'decreasing';
    return 'stable';
  }
}

module.exports = new SerperService();