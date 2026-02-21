const axios = require('axios');

const HOURS_PER_YEAR = 2080;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

const CURRENCY_TO_INR = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
  CAD: 62,
  AUD: 55,
  SGD: 62,
  CHF: 95,
  JPY: 0.55,
};

class SerperService {
  constructor() {
    this.apiKey = process.env.SERPER_API_KEY;
    this.baseURL = 'https://google.serper.dev';
    this.jsearchHost = process.env.JSEARCH_RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';
    this.jsearchKey = process.env.JSEARCH_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
  }

  async search(query, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('SERPER_API_KEY is not configured');
      }

      const response = await axios.post(
        `${this.baseURL}/search`,
        {
          q: query,
          num: options.num || 10,
          gl: options.country || 'us',
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Serper API Error:', error.message);
      throw new Error('Failed to fetch search results');
    }
  }

  async fetchJobListings(jobTitle, location) {
    const response = await axios.get(`https://${this.jsearchHost}/search`, {
      params: {
        query: `${jobTitle} in ${location}`,
        page: '1',
        num_pages: '1',
      },
      headers: {
        'X-RapidAPI-Key': this.jsearchKey,
        'X-RapidAPI-Host': this.jsearchHost,
      },
    });
    return response.data;
  }

  async tryFetchListings(jobTitle, location) {
    if (!this.jsearchKey) {
      console.warn('JSearch RapidAPI key is missing. Skipping live listing fetch.');
      return null;
    }

    try {
      const response = await this.fetchJobListings(jobTitle, location);
      return response.data || [];
    } catch (error) {
      console.error('JSearch API Error:', error.message);
      return null;
    }
  }

  async fetchSearchBundles(jobTitle, location) {
    const queries = [
      `${jobTitle} average salary ${location} 2024`,
      `${jobTitle} job demand trends ${location}`,
      `top companies hiring ${jobTitle} ${location}`,
      `${jobTitle} skills requirements 2024`,
      `remote ${jobTitle} jobs statistics`,
    ];

    return Promise.all(queries.map((query) => this.search(query, { num: 5 })));
  }

  async getJobMarketIntelligence(jobTitle, location) {
    try {
      const listings = await this.tryFetchListings(jobTitle, location);
      if (listings && listings.length) {
        return this.buildInsightsFromListings(listings, jobTitle, location);
      }

      console.warn('Falling back to SERPER heuristic data for market intelligence.');
      const searchBundles = await this.fetchSearchBundles(jobTitle, location);
      return this.buildInsightsFromSearch(searchBundles);
    } catch (error) {
      console.error('Market Intelligence Error:', error.message);
      throw error;
    }
  }

  buildInsightsFromListings(listings, jobTitle, location) {
    return {
      jobTitle,
      location,
      sampleSize: listings.length,
      source: 'jsearch',
      salaryData: this.aggregateSalary(listings),
      demandTrends: this.aggregateDemand(listings),
      topEmployers: this.aggregateEmployers(listings),
      skillRequirements: this.extractSkillsFromListings(listings),
      remoteOpportunities: this.aggregateRemote(listings),
      lastUpdated: new Date().toISOString(),
    };
  }

  buildInsightsFromSearch(results) {
    return {
      salaryData: this.extractSalaryTrends(results[0]),
      demandTrends: this.analyzeDemand(results[1]),
      topEmployers: this.extractCompanies(results[2]),
      skillRequirements: this.extractSkills(results[3]),
      remoteOpportunities: this.analyzeRemoteData(results[4]),
      source: 'serper',
      lastUpdated: new Date().toISOString(),
    };
  }

  aggregateSalary(listings) {
    const figures = [];

    listings.forEach((listing) => {
      const currency = (listing.job_salary_currency || 'USD').toUpperCase();
      const period = (listing.job_salary_period || 'year').toLowerCase();
      const minValue = this.convertSalaryFigure(listing.job_min_salary, period, currency);
      const maxValue = this.convertSalaryFigure(listing.job_max_salary, period, currency);

      if (minValue) figures.push(minValue);
      if (maxValue) figures.push(maxValue);
    });

    if (!figures.length) {
      return { average: 'N/A', range: 'N/A', trend: 'stable' };
    }

    figures.sort((a, b) => a - b);
    const min = Math.round(figures[0]);
    const max = Math.round(figures[figures.length - 1]);
    const average = Math.round(figures.reduce((sum, value) => sum + value, 0) / figures.length);

    return {
      average: { amount: average, currency: 'INR' },
      range: {
        min: { amount: min, currency: 'INR' },
        max: { amount: max, currency: 'INR' },
      },
      trend: this.deriveListingTrend(listings),
      dataPoints: figures.length,
    };
  }

  aggregateDemand(listings) {
    const total = listings.length;
    if (!total) {
      return { level: 'low', growth: 'stable', openings: 0, confidence: 60 };
    }

    const now = Date.now();
    const fresh = listings.filter((listing) => {
      const posted = listing.job_posted_at_datetime_utc
        ? Date.parse(listing.job_posted_at_datetime_utc)
        : null;
      if (!posted) return false;
      return now - posted <= 14 * 24 * 60 * 60 * 1000;
    }).length;

    const level = total > 45 ? 'high' : total > 20 ? 'moderate' : 'low';
    const freshnessRatio = fresh / total;
    const growth = freshnessRatio > 0.55 ? 'growing' : freshnessRatio < 0.25 ? 'cooling' : 'stable';
    const confidence = Math.min(95, Math.max(60, total * 2 + fresh));

    return {
      level,
      growth,
      openings: total,
      confidence,
    };
  }

  aggregateEmployers(listings) {
    const employerMap = new Map();

    listings.forEach((listing) => {
      const name = listing.employer_name || listing.job_publisher;
      if (!name) return;

      if (!employerMap.has(name)) {
        employerMap.set(name, {
          name,
          count: 0,
          locations: new Set(),
          salaries: [],
        });
      }

      const entry = employerMap.get(name);
      entry.count += 1;

      const locationParts = [listing.job_city, listing.job_state, listing.job_country].filter(Boolean);
      if (locationParts.length) {
        entry.locations.add(locationParts.join(', '));
      }

      const salary = this.estimateListingSalaryInINR(listing);
      if (salary) {
        entry.salaries.push(salary);
      }
    });

    return Array.from(employerMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((entry) => ({
        name: entry.name,
        locations: Array.from(entry.locations).slice(0, 3),
        openRoles: entry.count,
        medianSalary: entry.salaries.length
          ? { amount: this.median(entry.salaries), currency: 'INR' }
          : null,
      }));
  }

  extractSkillsFromListings(listings) {
    const skillCounts = new Map();

    listings.forEach((listing) => {
      const skills = new Set([
        ...(listing.job_required_skills || []),
        ...((listing.job_highlights?.Qualifications) || []),
        ...((listing.job_highlights?.Responsibilities) || []),
        ...((listing.job_highlights?.Benefits) || []),
      ]);

      skills.forEach((skill) => {
        if (!skill || skill.length > 60) return;
        const cleanSkill = skill.trim();
        if (!cleanSkill) return;
        skillCounts.set(cleanSkill, (skillCounts.get(cleanSkill) || 0) + 1);
      });
    });

    return Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill)
      .slice(0, 15);
  }

  aggregateRemote(listings) {
    const total = listings.length;
    if (!total) {
      return { percentage: 'N/A', availability: 'limited', trend: 'stable' };
    }

    const remoteCount = listings.filter((listing) => listing.job_is_remote === true).length;
    const hybridCount = listings.filter(
      (listing) => listing.job_is_remote === 'Hybrid' || listing.job_employment_type === 'Hybrid'
    ).length;

    const remotePercentage = Math.round((remoteCount / total) * 100);
    const availability = remotePercentage > 50 ? 'high' : remotePercentage > 25 ? 'moderate' : 'limited';

    const trend =
      remotePercentage + hybridCount * 2 > 60
        ? 'increasing'
        : remotePercentage < 20
        ? 'cooling'
        : 'stable';

    return {
      percentage: remotePercentage,
      availability,
      trend,
    };
  }

  deriveListingTrend(listings) {
    if (!listings.length) return 'stable';

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const recent = listings.filter((listing) => {
      const posted = listing.job_posted_at_datetime_utc
        ? Date.parse(listing.job_posted_at_datetime_utc)
        : null;
      if (!posted) return false;
      return now - posted <= thirtyDays;
    }).length;

    const ratio = recent / listings.length;

    if (ratio > 0.6) return 'increasing';
    if (ratio < 0.25) return 'decreasing';
    return 'stable';
  }

  estimateListingSalaryInINR(listing) {
    const currency = (listing.job_salary_currency || 'USD').toUpperCase();
    const period = (listing.job_salary_period || 'year').toLowerCase();
    const minSalary = this.convertSalaryFigure(listing.job_min_salary, period, currency);
    const maxSalary = this.convertSalaryFigure(listing.job_max_salary, period, currency);

    if (!minSalary && !maxSalary) return null;
    if (minSalary && maxSalary) {
      return Math.round((minSalary + maxSalary) / 2);
    }
    return Math.round(minSalary || maxSalary);
  }

  convertSalaryFigure(value, period, currency) {
    if (value === null || value === undefined) return null;
    const numericValue = Number(value);
    if (Number.isNaN(numericValue) || numericValue <= 0) return null;

    const annualized = this.normalizeAnnualSalary(numericValue, period);
    const rate = CURRENCY_TO_INR[currency] || CURRENCY_TO_INR.USD;
    return annualized * rate;
  }

  normalizeAnnualSalary(value, period) {
    switch (period) {
      case 'hour':
        return value * HOURS_PER_YEAR;
      case 'week':
        return value * WEEKS_PER_YEAR;
      case 'month':
        return value * MONTHS_PER_YEAR;
      case 'day':
        return value * 5 * WEEKS_PER_YEAR;
      default:
        return value;
    }
  }

  median(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }
    return Math.round(sorted[mid]);
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