const mongoose = require('mongoose');
const aiService = require('../services/aiService');
const ProviderProfile = require('../models/ProviderProfile');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');

/**
 * ==============================================
 * AI FEATURE 1: CHATBOT CONTROLLER
 * ==============================================
 * Handles conversational messages from customers, providers, and admins
 * Context-aware responses based on user role
 */
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'message required' });
    }
    
    const userRole = req.user?.role || 'customer';
    const userId = req.user?.id;
    
    // Prepare context for AI
    const context = {
      role: userRole,
      userId,
      message: message.trim(),
    };
    
    // Get AI response with role context
    const reply = await aiService.chat(message.trim(), context);
    
    // Optional: detect intent for better routing
    const intent = await aiService.detectIntent(message.trim(), userRole);
    
    res.json({ 
      success: true, 
      data: { 
        reply,
        intent,
        role: userRole,
        timestamp: new Date(),
      } 
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ==============================================
 * AI FEATURE 2: PROVIDER RECOMMENDATION
 * ==============================================
 * Uses AI to understand search intent and semantically match providers
 * Scores by keyword matching, ratings, and completion rate
 */
exports.recommendProvider = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    // Fetch all complete provider profiles
    let profiles = await ProviderProfile.find({ isComplete: true })
      .populate('user', 'name email')
      .lean();

    if (profiles.length === 0) {
      return res.json({ 
        success: true, 
        data: [],
        message: 'No providers available matching your search' 
      });
    }

    // Fetch ratings and reviews for all providers
    const providerIds = profiles.map((p) => p.user._id.toString());
    const ratings = await Review.aggregate([
      { 
        $match: { 
          provider: { $in: providerIds.map((id) => new mongoose.Types.ObjectId(id)) } 
        } 
      },
      { 
        $group: { 
          _id: '$provider', 
          avg: { $avg: '$rating' }, 
          count: { $sum: 1 } 
        } 
      },
    ]);

    // Build rating map
    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = { avg: r.avg, count: r.count };
    });

    // Enrich profiles with rating data
    profiles = profiles.map((p) => ({
      ...p,
      providerId: p.user._id,
      rating: ratingMap[p.user._id.toString()]?.avg ?? 0,
      reviewCount: ratingMap[p.user._id.toString()]?.count ?? 0,
    }));

    // Use AI to recommend based on semantic search
    const searchQuery = query.trim();
    const recommended = await aiService.recommendProviders(searchQuery, profiles);

    res.json({ 
      success: true, 
      data: recommended.slice(0, 20),  // Limit to top 20
      searchQuery,
      totalResults: recommended.length,
    });
  } catch (err) {
    console.error('Provider recommendation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ==============================================
 * AI FEATURE 3: EMAIL GENERATOR
 * ==============================================
 * Generates professional email content for appointment confirmations,
 * cancellations, rescheduling, and other notifications
 */
exports.generateEmail = async (req, res) => {
  try {
    const { userName, providerName, date, time, action } = req.body;
    
    // Validate required fields
    if (!userName || !providerName) {
      return res.status(400).json({ 
        success: false, 
        message: 'userName and providerName are required' 
      });
    }

    const emailBody = await aiService.generateEmailBody({
      userName: userName.trim(),
      providerName: providerName.trim(),
      date: date || 'TBD',
      time: time || 'TBD',
      action: action || 'confirmed',
    });

    res.json({ 
      success: true, 
      data: { 
        body: emailBody,
        action: action || 'confirmed',
        recipient: userName,
        provider: providerName,
        generatedAt: new Date(),
      } 
    });
  } catch (err) {
    console.error('Email generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ==============================================
 * AI FEATURE 4: KEYWORD GENERATOR
 * ==============================================
 * Extracts professional keywords from provider profiles
 * Improves searchability and recommendation matching
 * Called by providers to optimize their profiles
 */
exports.generateKeywords = async (req, res) => {
  try {
    // Require authentication and provider role
    if (req.user?.role !== 'provider') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only providers can generate profile keywords' 
      });
    }

    // Get provider's own profile
    const profile = await ProviderProfile.findOne({ user: req.user.id }).lean();
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider profile not found' 
      });
    }

    // Generate keywords using AI
    const keywords = await aiService.generateProfileKeywords(profile);

    res.json({ 
      success: true, 
      data: { 
        keywords,
        profile: {
          businessName: profile.businessName,
          domain: profile.domain,
          description: profile.description,
        },
        message: 'Keywords generated successfully. You can use these for SEO and searchability.',
      } 
    });
  } catch (err) {
    console.error('Keyword generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ==============================================
 * ADMIN FEATURES: ANALYTICS & INSIGHTS
 * ==============================================
 * Provides AI-generated analysis of provider performance
 * Admin-only access
 */
exports.analyzeProviderPerformance = async (req, res) => {
  try {
    // Require admin role
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can view analytics' 
      });
    }

    const { providerId } = req.query;
    
    if (!providerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'providerId required' 
      });
    }

    // Fetch provider metrics
    const totalBookings = await Appointment.countDocuments({ provider: providerId });
    const completedBookings = await Appointment.countDocuments({ 
      provider: providerId, 
      status: 'completed' 
    });

    const reviews = await Review.find({ provider: providerId }).lean();
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    const cancellationRate = totalBookings > 0 
      ? (
          ((await Appointment.countDocuments({ provider: providerId, status: 'cancelled' })) / totalBookings) * 100
        ).toFixed(1)
      : 0;

    const metrics = {
      totalBookings,
      completedBookings,
      avgRating: parseFloat(avgRating),
      cancellationRate: parseFloat(cancellationRate),
      reviewCount: reviews.length,
    };

    // Get AI analysis
    const analysis = await aiService.analyzeProviderMetrics(metrics);

    res.json({ 
      success: true, 
      data: { 
        providerId,
        metrics,
        analysis,
        insights: {
          performanceLevel: getPerformanceLevel(avgRating),
          completionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0,
          recommendation: generateRecommendation(metrics),
        },
      } 
    });
  } catch (err) {
    console.error('Performance analysis error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Advanced Admin Chat: Complex analytics and system insights
 */
exports.adminChat = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'query required' });
    }

    // Get system overview
    const totalUsers = await mongoose.model('User').countDocuments();
    const totalProviders = await ProviderProfile.countDocuments({ isComplete: true });
    const totalAppointments = await Appointment.countDocuments();
    const totalReviews = await Review.countDocuments();

    const context = {
      role: 'admin',
      systemData: {
        totalUsers,
        totalProviders,
        totalAppointments,
        totalReviews,
      },
    };

    const reply = await aiService.chat(query.trim(), context);

    res.json({ 
      success: true, 
      data: { 
        reply,
        systemContext: context.systemData,
        timestamp: new Date(),
      } 
    });
  } catch (err) {
    console.error('Admin chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Health check for AI service
 */
exports.healthCheck = async (req, res) => {
  try {
    const hasApiKey = !!process.env.HUGGINGFACE_API_KEY;
    
    res.json({ 
      success: true, 
      data: { 
        aiServiceStatus: 'active',
        huggingFaceConfigured: hasApiKey,
        models: {
          chat: aiService.MODELS.CHAT,
          textGeneration: aiService.MODELS.TEXT_GEN,
          classification: aiService.MODELS.CLASSIFICATION,
          embeddings: aiService.MODELS.EMBEDDINGS,
        },
        message: 'AI service is operational',
      } 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'AI service error: ' + err.message 
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getPerformanceLevel(rating) {
  if (rating >= 4.7) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.0) return 'Good';
  if (rating >= 2.0) return 'Fair';
  return 'Needs Improvement';
}

function generateRecommendation(metrics) {
  const { avgRating, cancellationRate, completionRate } = metrics;
  
  if (avgRating >= 4.5 && cancellationRate < 5) {
    return 'Maintain current quality and encourage more customer reviews.';
  }
  if (cancellationRate > 15) {
    return 'Address cancellation patterns to improve customer satisfaction.';
  }
  if (avgRating < 3.5) {
    return 'Review customer feedback and consider improving service quality.';
  }
  return 'Performance is acceptable. Continue monitoring metrics.';
}
