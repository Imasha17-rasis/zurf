const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if API key is set
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not set in .env file');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache for API responses to reduce quota usage
const responseCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Generate a natural, friendly response using AI
 */
async function generateFriendlyResponse(message, extractedPrefs, hasPreferences) {
  try {
    const cacheKey = `friendly_${JSON.stringify(extractedPrefs)}_${hasPreferences.join('_')}`;
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Using cached friendly response');
        return cached.data;
      }
    }

    // Try AI generation
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const missingPrefs = [];
      if (!hasPreferences.includes('experience')) missingPrefs.push('experience level');
      if (!hasPreferences.includes('month')) missingPrefs.push('travel month');
      if (!hasPreferences.includes('wave')) missingPrefs.push('wave type preference');

      const prompt = `Generate a friendly surf chatbot response (1-2 sentences max).
User just said: "${message}"

What we learned: ${extractedPrefs.experienceLevel || 'nothing yet'}
${hasPreferences.includes('experience') ? `- Experience: ${extractedPrefs.experienceLevel}` : ''}
${hasPreferences.includes('month') ? `- Month: ${extractedPrefs.travelMonth}` : ''}
${hasPreferences.includes('wave') ? `- Waves: ${extractedPrefs.waveType}` : ''}

Next question: Ask about ${missingPrefs[0] || 'preferences'} in a fun, encouraging way with emojis!`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
      console.log('✅ Using AI-generated friendly response');
      return response;
    } catch (apiError) {
      console.log('⚠️ API unavailable, using template fallback');
      return generateFriendlyTemplate(extractedPrefs, hasPreferences);
    }
  } catch (error) {
    console.error('Error generating friendly response:', error.message);
    return 'Awesome! Tell me more about what you\'re looking for! 🏄‍♂️';
  }
}

function generateFriendlyTemplate(extractedPrefs, hasPreferences) {
  const templates = {
    'experience_only': [
      'Perfect! 🌊 Now, when are you planning to travel?',
      'Great! You\'re {level}! 🏄‍♂️ When do you want to catch some waves?',
      'Nice! {level} it is! 📅 What month works best for you?'
    ],
    'experience_month': [
      'Awesome! {level} surfer heading out in {month}! 🌊 What kind of waves are you after?',
      'Cool! {level} + {month}! 🏄‍♂️ Small, medium, big, or hollow waves?',
      'Got it - {level} in {month}! What\'s your ideal wave type? 🌊'
    ],
    'default': [
      'Awesome! Tell me more about what you\'re looking for! 🏄‍♂️',
      'Sweet! Keep sharing your preferences! 🌊',
      'Great! What else can you tell me? 🏄‍♂️'
    ]
  };

  let keyTemplate = 'default';
  if (hasPreferences.includes('experience') && hasPreferences.includes('month')) {
    keyTemplate = 'experience_month';
  } else if (hasPreferences.includes('experience')) {
    keyTemplate = 'experience_only';
  }

  const templates_array = templates[keyTemplate] || templates.default;
  let template = templates_array[Math.floor(Math.random() * templates_array.length)];

  template = template.replace('{level}', extractedPrefs.experienceLevel || 'surfer');
  template = template.replace('{month}', formatMonth(extractedPrefs.travelMonth) || 'season');

  return template;
}

// Helper to format month ranges into readable text
function formatMonth(month) {
  const monthNames = {
    'january-march': 'summer',
    'april-june': 'autumn',
    'july-september': 'winter',
    'october-december': 'spring'
  };
  return monthNames[month] || month;
}

/**
 * Extract preferences using pattern matching (fast, no API)
 */
function extractPreferencesUsingPatterns(message) {
  const lowerMessage = message.toLowerCase();
  const preferences = {
    experienceLevel: null,
    travelMonth: null,
    waveType: null
  };

  // Experience Level patterns
  if (/(beginner|novice|start|new|learn|first time)/.test(lowerMessage)) {
    preferences.experienceLevel = 'beginner';
  } else if (/(intermediate|some|bit of experience|mid)/.test(lowerMessage)) {
    preferences.experienceLevel = 'intermediate';
  } else if (/(advanced|expert|pro|experienced|skilled)/.test(lowerMessage)) {
    preferences.experienceLevel = 'advanced';
  } else if (/🟢/.test(message)) {
    preferences.experienceLevel = 'beginner';
  } else if (/🟡/.test(message)) {
    preferences.experienceLevel = 'intermediate';
  } else if (/🔴/.test(message)) {
    preferences.experienceLevel = 'advanced';
  }

  // Travel Month patterns
  if (/(january|february|march|jan|feb|mar|summer|jan-mar)/.test(lowerMessage)) {
    preferences.travelMonth = 'january-march';
  } else if (/(april|may|june|apr|may|autumn|apr-jun)/.test(lowerMessage)) {
    preferences.travelMonth = 'april-june';
  } else if (/(july|august|september|jul|aug|sep|winter|jul-sep)/.test(lowerMessage)) {
    preferences.travelMonth = 'july-september';
  } else if (/(october|november|december|oct|nov|dec|spring|oct-dec)/.test(lowerMessage)) {
    preferences.travelMonth = 'october-december';
  }

  // Wave Type patterns
  if (/(small|gentle|easy|weak|smooth|〰️)/.test(lowerMessage)) {
    preferences.waveType = 'small';
  } else if (/(medium|medium-sized|moderate|〰️〰️|med)/.test(lowerMessage)) {
    preferences.waveType = 'medium';
  } else if (/(big|large|huge|powerful|massive|🌊🌊)/.test(lowerMessage)) {
    preferences.waveType = 'big';
  } else if (/(hollow|barrel|barreling|tube|⚡)/.test(lowerMessage)) {
    preferences.waveType = 'hollow';
  }

  return preferences;
}

/**
 * Extract user preferences from their message
 * Returns: { experienceLevel, travelMonth, waveType, rawResponse }
 */
exports.extractPreferencesFromMessage = async (message, conversationHistory = []) => {
  try {
    // Check cache first
    const cacheKey = `prefs_${message.substring(0, 50)}`;
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Using cached preference response');
        return cached.data;
      }
    }

    // First try pattern-based extraction (instant, no API)
    const patternPrefs = extractPreferencesUsingPatterns(message);
    
    // If we got some preferences from patterns, use those
    if (patternPrefs.experienceLevel || patternPrefs.travelMonth || patternPrefs.waveType) {
      console.log('✅ Using pattern-matched preferences:', patternPrefs);
      
      // Generate AI-powered friendly response
      const hasPreferences = [];
      if (patternPrefs.experienceLevel) hasPreferences.push('experience');
      if (patternPrefs.travelMonth) hasPreferences.push('month');
      if (patternPrefs.waveType) hasPreferences.push('wave');
      
      const friendlyResponse = await generateFriendlyResponse(message, patternPrefs, hasPreferences);
      
      const response = {
        experienceLevel: patternPrefs.experienceLevel,
        travelMonth: patternPrefs.travelMonth,
        waveType: patternPrefs.waveType,
        isComplete: false,
        nextQuestion: null,
        friendlyResponse: friendlyResponse
      };

      responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
      return response;
    }

    // If patterns didn't help, try API (only for complex messages)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const fullPrompt = `Extract surf preferences from this message:
Message: "${message}"

Return JSON:
{
  "experienceLevel": "beginner|intermediate|advanced|null",
  "travelMonth": "january-march|april-june|july-september|october-december|null",
  "waveType": "small|medium|big|hollow|null",
  "friendlyResponse": "brief friendly response"
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const response = {
      experienceLevel: parsed.experienceLevel,
      travelMonth: parsed.travelMonth,
      waveType: parsed.waveType,
      isComplete: false,
      nextQuestion: null,
      friendlyResponse: parsed.friendlyResponse || 'Tell me more about your preferences! 🏄‍♂️'
    };

    responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
    return response;
  } catch (error) {
    console.error('Error extracting preferences:', error.message);
    // Return fallback response
    return {
      experienceLevel: null,
      travelMonth: null,
      waveType: null,
      isComplete: false,
      nextQuestion: 'Tell me about your surfing experience and travel plans',
      friendlyResponse: 'I didn\'t quite get that. Could you tell me:\n1️⃣ Your experience level (beginner/intermediate/advanced)\n2️⃣ When you want to travel (month/season)\n3️⃣ Wave type preference (small/medium/big/hollow)'
    };
  }
};

/**
 * Generate a friendly recommendation response with AI (falls back to template if quota exceeded)
 */
exports.generateRecommendationResponse = async (preferences, surfSpots) => {
  try {
    if (!surfSpots || surfSpots.length === 0) {
      return 'I couldn\'t find exact matches, but check out these amazing spots that might suit you! 🌊';
    }

    // Check cache first
    const cacheKey = `rec_${JSON.stringify(preferences)}`;
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Using cached recommendation response');
        return cached.data;
      }
    }

    // Try API call for better personalization
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const spotsInfo = surfSpots.map(spot => ({
        name: spot.name,
        location: `${spot.location.city}, ${spot.location.country}`,
        rating: spot.rating,
        price: spot.pricePerHour,
        description: spot.description ? spot.description.substring(0, 100) : ''
      }));

      const prompt = `You are a friendly and enthusiastic surf expert. Generate a 1-2 sentence personalized recommendation for these spots based on the user's preferences.

User Preferences: ${preferences.experienceLevel} surfer, traveling in ${formatMonth(preferences.travelMonth)}, seeking ${preferences.waveType || 'quality'} waves.

Top Spots:
${spotsInfo.slice(0, 3).map(s => `- ${s.name} (${s.rating}⭐) in ${s.location}`).join('\n')}

Keep it enthusiastic, specific, and under 80 words!`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Cache the response
      responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
      console.log('✅ Using AI-generated recommendation response');
      return response;
    } catch (apiError) {
      // If API fails, use template fallback
      console.log('⚠️ API unavailable, using template fallback:', apiError.message.substring(0, 50));
      return generateRecommendationTemplate(preferences, surfSpots);
    }
  } catch (error) {
    console.error('Error generating recommendation:', error.message);
    return 'Here are some great surf spots that match your preferences! 🏄‍♂️';
  }
};

/**
 * Template-based recommendation fallback (when API is unavailable)
 */
function generateRecommendationTemplate(preferences, surfSpots) {
  if (!surfSpots || surfSpots.length === 0) {
    return 'I couldn\'t find exact matches, but check out these amazing spots that might suit you! 🌊';
  }

  const topSpot = surfSpots[0];
  const waveDesc = preferences.waveType === 'big' ? 'gnarly' : 
                   preferences.waveType === 'hollow' ? 'barrel-filled' :
                   preferences.waveType === 'small' ? 'mellow' : 'perfect';
  
  const levelDesc = preferences.experienceLevel === 'beginner' ? 'beginner-friendly' :
                    preferences.experienceLevel === 'intermediate' ? 'intermediate' : 'advanced';
  
  const monthName = formatMonth(preferences.travelMonth);

  const templates = {
    beginner: [
      `Perfect! I found ${surfSpots.length} beginner-friendly spots! 🌊 ${topSpot.name} in ${topSpot.location.country} is rated ${topSpot.rating}/5 and has excellent ${waveDesc} waves for ${monthName}. You'll love it! 🏄‍♂️`,
      `Awesome! Here are ${surfSpots.length} perfect spots for you! ${topSpot.name} (${topSpot.rating}⭐) in ${topSpot.location.country} is ideal for ${levelDesc} surfers. Let's book it! 🌊`,
    ],
    intermediate: [
      `Excellent! ${surfSpots.length} great spots found! 🌊 ${topSpot.name} (${topSpot.rating}/5) in ${topSpot.location.country} is perfect for ${levelDesc} surfers. Time to get some footage! 🏄‍♂️`,
      `Yes! These ${surfSpots.length} spots are exactly what you need! 🌊 ${topSpot.name} offers quality ${waveDesc} waves. Let's do it! 🎯`,
    ],
    advanced: [
      `Sick! ${surfSpots.length} premium spots for the crew! 🌊 ${topSpot.name} in ${topSpot.location.country} is rated ${topSpot.rating}/5 and pumps with ${waveDesc} waves. Challenge accepted? 🏄‍♂️`,
      `Fire! These ${surfSpots.length} spots are next level! 🏄‍♂️ ${topSpot.name} is stacked with quality ${waveDesc} action. Let's shred! 🌊`,
    ]
  };

  const level = preferences.experienceLevel || 'intermediate';
  const levelTemplates = templates[level] || templates.intermediate;
  const template = levelTemplates[Math.floor(Math.random() * levelTemplates.length)];

  console.log('✅ Using template-based recommendation (fallback)');
  return template;
}

/**
 * Generate initial greeting message (no API calls - predefined)
 */
exports.generateGreeting = async () => {
  try {
    // Use predefined greeting - no API call to save quota
    return "Hey there! 🏄‍♂️ I'm your Surf AI Assistant. I'm here to help you find the perfect surf destination!\n\nLet's start with your experience level. Are you a beginner, intermediate, or advanced surfer?";
  } catch (error) {
    console.error('Error generating greeting:', error.message);
    return 'Hey there! 🏄‍♂️ I\'m your Surf AI Assistant. What can I help you with?';
  }
};

/**
 * Parse preferences and generate quick reply buttons
 */
exports.generateQuickReplies = (step) => {
  const replies = {
    experience: [
      { text: '🟢 Beginner', value: 'beginner' },
      { text: '🟡 Intermediate', value: 'intermediate' },
      { text: '🔴 Advanced', value: 'advanced' }
    ],
    month: [
      { text: 'Jan-Mar (Summer)', value: 'january-march' },
      { text: 'Apr-Jun (Autumn)', value: 'april-june' },
      { text: 'Jul-Sep (Winter)', value: 'july-september' },
      { text: 'Oct-Dec (Spring)', value: 'october-december' }
    ],
    wave: [
      { text: '🌊 Small Waves', value: 'small' },
      { text: '〰️ Medium Waves', value: 'medium' },
      { text: '🌊🌊 Big Waves', value: 'big' },
      { text: '⚡ Hollow/Barreling', value: 'hollow' }
    ]
  };

  return replies[step] || [];
};

/**
 * Detect if message is asking for help/directions vs preference collection
 * Uses pattern matching - NO API calls to save quota
 */
exports.detectQuestionIntent = (message) => {
  const lowerMessage = message.toLowerCase();

  // Booking patterns
  if (/(book|booking|reserve|reservation|how.*book|book.*how|booking.*process)/.test(lowerMessage)) {
    return 'booking';
  }

  // Guide patterns
  if (/(guide|instructor|teacher|lessons|teach|expertise|hire.*guide|guide.*hire)/.test(lowerMessage)) {
    return 'guides';
  }

  // Equipment patterns
  if (/(gear|equipment|surfboard|board|wetsuit|rent|rental|equipment)/.test(lowerMessage)) {
    return 'equipment';
  }

  // Spot patterns
  if (/(spot|destination|beach|locale|location|best.*place|perfect.*place|where.*\?|recommend)/.test(lowerMessage)) {
    return 'spots';
  }

  // Help patterns
  if (/(help|support|what.*can.*do|what.*help|feature|how.*use|how.*work|info)/.test(lowerMessage)) {
    return 'help';
  }

  // Default to preferences
  return 'preferences';
};

/**
 * Generate response for common questions/help (tries AI, falls back to template)
 */
exports.generateHelpResponse = async (message, intent) => {
  try {
    const cacheKey = `help_${intent}_${message.substring(0, 30)}`;
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Using cached help response');
        return cached.data;
      }
    }

    // Try AI generation
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const intentDescriptions = {
        booking: 'asking about booking a surf experience',
        guides: 'asking about surf instructors/guides',
        equipment: 'asking about gear rental',
        spots: 'asking how to find surf spots',
        help: 'asking what I can help with'
      };

      const prompt = `Generate a brief, helpful surf chatbot response (2-3 sentences).
User is ${intentDescriptions[intent] || 'asking for help'}. Their message: "${message}"

Be friendly, specific to their question, include relevant emojis, and ask a follow-up if helpful!`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
      console.log('✅ Using AI-generated help response');
      return response;
    } catch (apiError) {
      console.log('⚠️ API unavailable for help, using template fallback');
      return generateHelpTemplate(intent);
    }
  } catch (error) {
    console.error('Error generating help response:', error.message);
    return 'How can I help you? 🏄‍♂️';
  }
};

function generateHelpTemplate(intent) {
  const templateResponses = {
    booking: [
      'Great question! Booking is super easy! 📅 Just pick your spot, choose a date, and we\'ll confirm everything. Need help finding the right spot first?',
      'Awesome! We handle bookings seamlessly! 🏄‍♂️ Select your favorite surf spot, pick your dates, and you\'re all set. Ready to browse spots?',
      'Perfect timing! Our booking system is straightforward: find a spot → pick dates → confirm! 🎯 Want me to show you our top rated spots?'
    ],
    guides: [
      'Fantastic! We have experienced guides for all levels! 🎓 They\'ll teach you techniques, safety tips, and help you catch amazing waves. Want to see our top guides?',
      'Love the enthusiasm! 🏄‍♂️ Our guides are certified and super friendly! They customize lessons for beginners to advanced surfers. Interested in a lesson?',
      'Excellent! Our guide network is incredible! 🌊 Whether you\'re learning or progressing, we\'ve got the perfect mentor. Want to meet some guides?'
    ],
    equipment: [
      'Smart question! 🛹 We offer top-quality boards, wetsuits, and gear for all levels. Unsure what suits you? Our gear experts can help!',
      'Great! We have everything you need! 🏄‍♂️ Professional equipment rentals or purchases available. Looking for a specific type of board?',
      'Perfect! Our equipment selection is extensive! 🌊 From beginner-friendly boards to pro gear, we\'ve got you covered. What\'s your experience level?'
    ],
    spots: [
      'Awesome! Let me help you find your perfect wave! 🌊 Tell me about your experience level and what kind of waves you like, and I\'ll make great recommendations!',
      'Excellent question! 🏄‍♂️ I\'ve got access to amazing surf spots around the world! Share your preferences and I\'ll find ideal matches for you!',
      'Perfect! Finding epic waves is our specialty! 🌊 What\'s your experience level? Are you looking for mellow waves or monster barrels?'
    ],
    help: [
      'I\'m here to help! 💬 I can assist with finding spots, booking lessons, getting gear, connecting with guides, and planning your perfect surf trip!',
      'Awesome! Here\'s what I can do: 🏄‍♂️ Find ideal surf spots | Connect you with guides | Help with gear selection | Explain booking process | Answer questions!',
      'Happy to help! 🌊 Whether you need spot recommendations, guide booking, equipment info, or general assistance, I\'ve got you covered!'
    ]
  };

  const templates = templateResponses[intent] || templateResponses.help;
  const response = templates[Math.floor(Math.random() * templates.length)];

  return response;
}
