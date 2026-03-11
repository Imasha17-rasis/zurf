const SurfSpot = require('../models/SurfSpot');
const {
  extractPreferencesFromMessage,
  generateRecommendationResponse,
  generateGreeting,
  generateQuickReplies,
  detectQuestionIntent,
  generateHelpResponse
} = require('../utils/geminiHelper');

// Store active chat sessions in memory (in production, use Redis or MongoDB)
const chatSessions = new Map();

// @desc    Initialize chat session
// @route   POST /api/chat/initialize
// @access  Public
exports.initializeChat = async (req, res) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const greeting = await generateGreeting();
    const quickReplies = generateQuickReplies('experience');

    // Store session
    chatSessions.set(sessionId, {
      id: sessionId,
      conversationHistory: [],
      preferences: {
        experienceLevel: null,
        travelMonth: null,
        waveType: null
      },
      step: 'experience', // experience -> month -> wave -> complete
      createdAt: new Date(),
      lastActivity: new Date()
    });

    res.status(200).json({
      success: true,
      sessionId,
      message: greeting,
      quickReplies
    });
  } catch (error) {
    console.error('Error initializing chat:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize chat'
    });
  }
};

// @desc    Send chat message and get response
// @route   POST /api/chat/message
// @access  Public
exports.sendChatMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and message are required'
      });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: message
    });

    // Check if user is asking for general help/information
    const intent = detectQuestionIntent(message);
    
    let nextMessage;
    let quickReplies = [];
    let recommendations = null;

    // If user is asking about booking, guides, equipment, spots, or help - provide that info
    if (['booking', 'guides', 'equipment', 'spots', 'help'].includes(intent)) {
      nextMessage = await generateHelpResponse(message, intent);
      
      // Add follow-up quick replies
      if (intent === 'booking') {
        quickReplies = [
          { text: 'Find Spots', value: 'find-spots' },
          { text: 'View Guides', value: 'view-guides' },
          { text: 'Explore Equipment', value: 'explore-equipment' }
        ];
      } else if (intent === 'spots') {
        quickReplies = generateQuickReplies('experience');
        session.step = 'experience';
      } else if (['help', 'guides', 'equipment'].includes(intent)) {
        quickReplies = [
          { text: 'Get Recommendations', value: 'get-recommendations' },
          { text: 'Browse All', value: 'browse-all' },
          { text: 'Help', value: 'help' }
        ];
      }
    } else {
      // Continue with preference collection for recommendations
      // Extract preferences from message
      const extracted = await extractPreferencesFromMessage(
        message,
        session.conversationHistory
      );

      // Update preferences - only if we actually found something
      let preferencesUpdated = false;
      if (extracted.experienceLevel) {
        session.preferences.experienceLevel = extracted.experienceLevel;
        preferencesUpdated = true;
      }
      if (extracted.travelMonth) {
        session.preferences.travelMonth = extracted.travelMonth;
        preferencesUpdated = true;
      }
      if (extracted.waveType) {
        session.preferences.waveType = extracted.waveType;
        preferencesUpdated = true;
      }

      // Use API response if preferences were found, otherwise provide guidance
      nextMessage = extracted.friendlyResponse || 'Tell me about your preferences!';

      // Progress through conversation steps based on what we have
      if (!session.preferences.experienceLevel) {
        session.step = 'experience';
        quickReplies = generateQuickReplies('experience');
      } else if (!session.preferences.travelMonth) {
        session.step = 'month';
        quickReplies = generateQuickReplies('month');
      } else if (!session.preferences.waveType) {
        session.step = 'wave';
        quickReplies = generateQuickReplies('wave');
      } else {
        // All preferences collected - get recommendations
        session.step = 'complete';
        const spots = await filterSurfSpots(session.preferences);
        recommendations = spots;
        
        // Generate friendly recommendation message
        if (spots.length > 0) {
          nextMessage = await generateRecommendationResponse(
            session.preferences,
            spots
          );
        } else {
          nextMessage = 'I couldn\'t find exact matches, but check out these amazing spots that might suit you!';
        }
        
        // Add action buttons after recommendations
        if (recommendations && recommendations.length > 0) {
          quickReplies = [
            { text: '🔄 New Search', value: 'new-search' },
            { text: '💬 View All Spots', value: 'view-all' },
            { text: '❓ Help', value: 'help' }
          ];
        }
      }
    }

    // Add bot message to history
    session.conversationHistory.push({
      role: 'assistant',
      content: nextMessage
    });

    session.lastActivity = new Date();

    res.status(200).json({
      success: true,
      message: nextMessage,
      quickReplies,
      recommendations,
      step: session.step
    });
  } catch (error) {
    console.error('Error in sendChatMessage:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process your message'
    });
  }
};

// @desc    Filter surf spots based on preferences
// Helper function to match preferences with surf spots
async function filterSurfSpots(preferences) {
  try {
    // Start with all verified spots
    let query = { isVerified: true };

    // Build query based on preferences
    const spots = await SurfSpot.find(query)
      .populate('guides', 'name expertise -_id')
      .populate('gears', 'name -_id')
      .limit(5);

    if (spots.length === 0) {
      // If no verified spots, get any spots
      return await SurfSpot.find({})
        .populate('guides', 'name expertise -_id')
        .populate('gears', 'name -_id')
        .limit(5);
    }

    // Score and rank spots based on preferences
    const scoredSpots = spots.map(spot => {
      let score = spot.rating || 0;

      // Bonus points for matching experience level in guides
      if (preferences.experienceLevel && spot.guides && spot.guides.length > 0) {
        const hasMatchingGuide = spot.guides.some(guide =>
          guide.expertise && guide.expertise.toLowerCase().includes(
            preferences.experienceLevel.toLowerCase()
          )
        );
        if (hasMatchingGuide) score += 2;
      }

      // Bonus points for wave type match (if mentioned in description)
      if (preferences.waveType && spot.description) {
        if (spot.description.toLowerCase().includes(preferences.waveType.toLowerCase())) {
          score += 1.5;
        }
      }

      return { ...spot.toObject(), score };
    });

    // Sort by score and return
    return scoredSpots
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...spot }) => spot);
  } catch (error) {
    console.error('Error filtering surf spots:', error);
    return [];
  }
}

// @desc    Get chat history
// @route   GET /api/chat/:sessionId
// @access  Public
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history'
    });
  }
};

// Cleanup old sessions periodically (every 30 minutes)
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of chatSessions) {
    const timeDiff = now - session.lastActivity;
    // Remove sessions inactive for more than 60 minutes
    if (timeDiff > 60 * 60 * 1000) {
      chatSessions.delete(sessionId);
      console.log(`Cleaned up old chat session: ${sessionId}`);
    }
  }
}, 30 * 60 * 1000);
