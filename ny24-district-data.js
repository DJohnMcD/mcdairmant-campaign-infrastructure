// NY-24 Congressional District Specific Data and Monitoring
// Campaign infrastructure for challenging Claudia Tenney in 2026

const NY24_DISTRICT_DATA = {
  // District geographic and demographic profile
  profile: {
    cookPVI: "R+13", // Heavily Republican district
    counties: [
      "Wayne", "Oswego", "Jefferson", "Ontario", "Livingston", 
      "Niagara", "Genesee", "Wyoming", "Seneca", "Yates", 
      "Schuyler", "Orleans", "Cayuga", "parts of others"
    ],
    keyCharacteristics: {
      rural: true,
      agricultural: "Major dairy farming, apple production",
      energy: "Nuclear power plants (3 facilities, 4 reactors)",
      lakeOntario: "Runs along Lake Ontario shore",
      economicDrivers: ["Agriculture", "Energy", "Manufacturing", "Tourism"]
    },
    results2024: {
      tenney: "64%",
      opponent: "36%", 
      turnout: "Typical for R+13 district"
    }
  },

  // Key counties for voter outreach priority
  priorityCounties: [
    {
      name: "Wayne",
      profile: "Apple production hub, rural-suburban mix",
      voterStrategy: "Economic messaging around agriculture support",
      demographics: "Working families, farmers, small business owners"
    },
    {
      name: "Oswego", 
      profile: "Lake Ontario shoreline, mixed economy",
      voterStrategy: "Environmental protection + economic opportunity",
      demographics: "Blue collar workers, retirees, young families"
    },
    {
      name: "Jefferson",
      profile: "North Country, Fort Drum military presence",
      voterStrategy: "Veterans affairs, rural infrastructure",
      demographics: "Military families, rural residents, veterans"
    }
  ],

  // Economic issues relevant to NY-24 voters
  keyIssues: {
    agriculture: {
      dairyFarming: "Support for dairy industry, fair milk pricing",
      appleProdution: "Wayne County apple industry support",
      farmLabor: "Agricultural worker policies",
      climateAdaptation: "Helping farms adapt to climate change"
    },
    energy: {
      nuclearJobs: "Supporting nuclear energy workforce",
      cleanEnergy: "Renewable energy transition planning", 
      gridStability: "Reliable power for rural areas",
      energyCosts: "Keeping energy affordable for families"
    },
    rural: {
      infrastructure: "Broadband, roads, bridges in rural areas",
      healthcare: "Rural hospital support, telehealth access",
      education: "Rural school funding, vocational training",
      economicDevelopment: "Supporting small towns and main streets"
    }
  },

  // Claudia Tenney opposition research framework
  opponent: {
    name: "Claudia Tenney",
    position: "Incumbent Representative (R)",
    strengths: [
      "Name recognition", 
      "Fundraising capacity",
      "District familiarity",
      "Republican voter base"
    ],
    vulnerabilities: [
      "Voting record vs. district needs",
      "National vs. local focus", 
      "Rural constituent services",
      "Moderate voter appeal"
    ],
    researchCategories: [
      "voting_record",
      "fundraising_sources", 
      "public_statements",
      "town_halls_attendance",
      "rural_advocacy_record",
      "agriculture_positions"
    ]
  },

  // Voter contact strategy for NY-24
  voterContactStrategy: {
    rural: {
      methods: ["Door-to-door", "Community events", "Farm visits"],
      messaging: "Local economics, practical solutions",
      timing: "Agricultural calendar-aware scheduling"
    },
    suburban: {
      methods: ["Digital outreach", "Town halls", "Coffee shops"],
      messaging: "Education, healthcare, infrastructure", 
      timing: "Evening and weekend availability"
    },
    youth: {
      methods: ["Social media", "College campuses", "community events"],
      messaging: "Economic opportunity, climate action",
      platforms: ["TikTok", "Instagram", "Snapchat"]
    }
  },

  // Media and communication strategy
  mediaStrategy: {
    localMedia: [
      "Syracuse.com/Post-Standard",
      "Watertown Daily Times", 
      "Finger Lakes Times",
      "WRVO Public Media",
      "Local radio stations"
    ],
    messagingFramework: {
      core: "Real solutions for real people in NY-24",
      agriculture: "Supporting our farmers and rural economy",
      energy: "Good jobs and reliable power for families",
      healthcare: "Accessible, affordable healthcare for everyone"
    },
    contentStrategy: {
      authentic: "Show real conversations with constituents",
      local: "Every piece of content ties to NY-24 specifically",
      solutions: "Policy positions with concrete local benefits",
      contrast: "Compare records and priorities with Tenney"
    }
  },

  // Fundraising strategy for challenging an incumbent
  fundraisingStrategy: {
    local: {
      target: "Build strong donor base within NY-24",
      methods: ["House parties", "Farm visits", "Local business outreach"],
      messaging: "Local investment in local representation"
    },
    digital: {
      target: "National small-dollar donations",
      methods: ["ActBlue", "Social media", "Email campaigns"], 
      messaging: "Flipping a red seat, rural progressive values"
    },
    events: {
      types: ["Town halls with suggested donations", "Volunteer appreciation"],
      frequency: "Monthly major events, weekly smaller gatherings",
      locations: "Rotate through all priority counties"
    }
  }
};

// Monitoring targets for automated research
const MONITORING_TARGETS = {
  // Claudia Tenney monitoring
  tenney: {
    website: "https://tenney.house.gov/",
    social: ["@ClaudiaTenney", "Facebook.com/RepClaudiaTenney"],
    votingRecords: ["congress.gov", "govtrack.us"],
    newsAlerts: ["Claudia Tenney", "NY-24", "New York 24th district"]
  },
  
  // Local news and issues monitoring  
  localNews: [
    "syracuse.com",
    "watertowndailytimes.com", 
    "fltimes.com",
    "wrvo.org"
  ],
  
  // Issue-specific monitoring
  issues: {
    agriculture: ["dairy prices", "farm bill", "agricultural policy NY"],
    energy: ["nuclear power NY", "energy grid", "clean energy jobs"],
    rural: ["rural broadband", "rural healthcare", "infrastructure"]
  }
};

// Helper functions for NY-24 specific analysis
const NY24_HELPERS = {
  // Determine if content is relevant to NY-24 voters
  isRelevantToDistrict: function(content) {
    const keywords = [
      'dairy', 'farm', 'agriculture', 'nuclear', 'energy', 'rural',
      'lake ontario', 'wayne county', 'oswego', 'jefferson', 'ontario county',
      'apple', 'manufacturing', 'veteran', 'fort drum'
    ];
    
    const lowerContent = content.toLowerCase();
    return keywords.some(keyword => lowerContent.includes(keyword));
  },

  // Generate county-specific messaging
  getCountyMessage: function(county, baseMessage) {
    const countyData = NY24_DISTRICT_DATA.priorityCounties.find(c => c.name === county);
    if (countyData) {
      return `${baseMessage} In ${county} County, this means ${countyData.voterStrategy}.`;
    }
    return baseMessage;
  },

  // Assess voter contact priority
  getVoterPriority: function(voter) {
    let priority = 5; // Default medium priority
    
    // Increase priority for target counties
    if (['Wayne', 'Oswego', 'Jefferson'].includes(voter.county)) {
      priority += 2;
    }
    
    // Increase priority for swing voters
    if (voter.party_affiliation === 'Independent' || voter.party_affiliation === 'Democrat') {
      priority += 1;
    }
    
    // Increase priority for high-propensity voters
    if (voter.voting_history && voter.voting_history.split(',').length >= 3) {
      priority += 1;
    }
    
    return Math.min(priority, 10); // Cap at 10
  }
};

module.exports = {
  NY24_DISTRICT_DATA,
  MONITORING_TARGETS, 
  NY24_HELPERS
};