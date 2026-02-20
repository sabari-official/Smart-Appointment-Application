const axios = require('axios');

const HF_API = 'https://api-inference.huggingface.co/models';
const API_KEY = process.env.HUGGINGFACE_API_KEY;

/**
 * Hugging Face Models Configuration
 * Using different, free, efficient models for each AI task
 */
const MODELS = {
  // Conversational AI - for chatbot (instruction-following model)
  CHAT: 'microsoft/DialoGPT-medium',

  // Text Generation - for email and content generation
  TEXT_GEN: 'google/flan-t5-base',

  // Zero-shot Classification - for intent detection & keyword extraction
  CLASSIFICATION: 'facebook/bart-large-mnli',

  // Feature Extraction - for semantic search and provider matching
  EMBEDDINGS: 'sentence-transformers/all-MiniLM-L6-v2',

  // Text-to-Text - for keyword generation
  KEYWORD_GEN: 'google/flan-t5-small',
};

/**
 * Generic Hugging Face API caller with retry and error handling
 */
async function callHuggingFace(model, payload, retries = 2) {
  if (!API_KEY) {
    console.warn('HUGGINGFACE_API_KEY not set - AI features will use fallbacks');
    return null;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `${HF_API}/${model}`;
      const { data } = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        timeout: 30000,
      });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;

      // Model loading - wait and retry
      if (errorMsg?.includes('loading') && attempt < retries) {
        console.log(`Model ${model} loading, retry in 5s... (attempt ${attempt + 1})`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      console.error(`Hugging Face API error (${model}):`, errorMsg);
      return null;
    }
  }
  return null;
}

/**
 * AI FEATURE 1: CHATBOT
 * Handles conversational queries from users, providers, and admins
 * Context-aware responses based on user role
 */
async function chat(userMessage, context = {}) {
  try {
    const role = context.role || 'user';
    const roleContext = getRoleContext(role);

    // Build system context
    let systemInfo = '';
    if (context.systemData) {
      systemInfo = `\nSystem stats: ${JSON.stringify(context.systemData)}`;
    }

    const prompt = `You are a helpful appointment booking assistant. You help ${roleContext}.${systemInfo}
User (${role}) message: "${userMessage}"
Respond briefly and helpfully. If it's about appointments, give specific guidance. If not related, politely redirect.
Response:`;

    const result = await callHuggingFace(MODELS.TEXT_GEN, { inputs: prompt });

    if (result && Array.isArray(result) && result[0]?.generated_text) {
      return cleanResponse(result[0].generated_text);
    }
    if (result && result.generated_text) {
      return cleanResponse(result.generated_text);
    }

    // Smart fallback based on role and message content
    return getSmartFallbackResponse(userMessage, role);
  } catch (err) {
    console.error('Chat error:', err);
    return getDefaultChatResponse(context.role);
  }
}

/**
 * AI FEATURE 2: PROVIDER RECOMMENDATION
 * Extracts keywords from search query and matches with provider profiles
 * Uses semantic matching and rating-based sorting
 */
async function recommendProviders(searchQuery, providerList) {
  try {
    if (!searchQuery || !providerList || providerList.length === 0) {
      return providerList;
    }

    // Step 1: Extract keywords using AI
    const keywords = await extractSearchKeywords(searchQuery);
    console.log(`Search keywords extracted: ${keywords.join(', ')}`);

    // Step 2: Try zero-shot classification to find domain
    const domains = [...new Set(providerList.map((p) => p.domain).filter(Boolean))];
    let matchedDomain = null;

    if (domains.length > 0) {
      const classResult = await callHuggingFace(MODELS.CLASSIFICATION, {
        inputs: searchQuery,
        parameters: {
          candidate_labels: domains,
        },
      });

      if (classResult?.labels?.[0]) {
        matchedDomain = classResult.labels[0];
        console.log(`AI matched domain: ${matchedDomain}`);
      }
    }

    // Step 3: Score providers
    const scored = providerList.map((p) => {
      const domain = (p.domain || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const name = (p.businessName || '').toLowerCase();
      const aiKws = (p.aiKeywords || []).map((k) => k.toLowerCase());

      let score = 0;

      // Domain match from AI classification
      if (matchedDomain && domain.toLowerCase() === matchedDomain.toLowerCase()) {
        score += 10;
      }

      // Keyword matching
      for (const kw of keywords) {
        const kwLower = kw.toLowerCase();
        if (domain.includes(kwLower)) score += 5;
        if (desc.includes(kwLower)) score += 3;
        if (name.includes(kwLower)) score += 2;
        if (aiKws.some((ak) => ak.includes(kwLower))) score += 4;
      }

      // Rating boost
      const ratingBoost = (p.rating || 0) * 0.5;
      score += ratingBoost;

      // Review count boost
      score += Math.min((p.reviewCount || 0) * 0.2, 5);

      return {
        ...(p.toObject ? p.toObject() : p),
        _matchScore: score,
        _keywords: keywords,
        _matchedDomain: matchedDomain,
      };
    });

    // Sort by score (high to low)
    scored.sort((a, b) => (b._matchScore || 0) - (a._matchScore || 0));

    return scored;
  } catch (err) {
    console.error('Provider recommendation error:', err);
    return providerList;
  }
}

/**
 * AI FEATURE 3: EMAIL GENERATOR
 * Generates professional, personalized email content for appointment notifications
 */
async function generateEmailBody({ userName, providerName, date, time, action }) {
  try {
    const actionLower = (action || 'confirmed').toLowerCase();

    const prompt = `Write a short professional email (2-3 sentences) for an appointment that was ${actionLower}.
Customer: ${userName}
Provider: ${providerName}
Date: ${date}
Time: ${time}
Generate only the email body, no subject line. Be professional and warm.
Email:`;

    const result = await callHuggingFace(MODELS.TEXT_GEN, { inputs: prompt });

    if (result && (result[0]?.generated_text || result.generated_text)) {
      const text = cleanResponse(result[0]?.generated_text || result.generated_text);
      if (text.length > 20) return text;
    }

    return getDefaultEmailBody(userName, providerName, date, time, actionLower);
  } catch (err) {
    console.error('Email generation error:', err);
    return getDefaultEmailBody(userName, providerName, date, time, action);
  }
}

/**
 * AI FEATURE 4: KEYWORD GENERATOR
 * Generates SEO/search keywords from provider profile
 */
async function generateProfileKeywords(providerProfile) {
  try {
    const { businessName, domain, description, address, workingHours } = providerProfile;

    const profileText = `
Business: ${businessName || 'N/A'}
Specialty: ${domain || 'N/A'}
Description: ${description || 'N/A'}
Location: ${address || 'N/A'}
Hours: ${workingHours || 'N/A'}
    `.trim();

    const prompt = `Extract 5-7 key professional keywords from this provider profile.
Profile:
${profileText}

Return only comma-separated keywords (lowercase). No explanations.
Keywords:`;

    const result = await callHuggingFace(MODELS.KEYWORD_GEN, { inputs: prompt });

    let keywords = [];
    if (result && (result[0]?.generated_text || result.generated_text)) {
      const text = (result[0]?.generated_text || result.generated_text).toLowerCase().trim();
      keywords = text
        .split(',')
        .map((kw) => kw.trim())
        .filter((kw) => kw.length > 1 && kw.length < 50)
        .slice(0, 8);
    }

    // Fallback
    if (keywords.length === 0) {
      keywords = [
        domain?.toLowerCase(),
        businessName?.toLowerCase(),
        'professional',
        'service',
        'appointment',
      ].filter(Boolean);
    }

    return keywords;
  } catch (err) {
    console.error('Keyword generation error:', err);
    return [
      providerProfile.domain?.toLowerCase(),
      providerProfile.businessName?.toLowerCase(),
      'professional',
    ].filter(Boolean);
  }
}

/**
 * Extract keywords from user search query
 */
async function extractSearchKeywords(query) {
  try {
    const prompt = `Extract the main search keywords from this query. Return only lowercase words separated by commas, maximum 5 words.
Query: "${query}"
Keywords:`;

    const result = await callHuggingFace(MODELS.KEYWORD_GEN, { inputs: prompt });

    if (result && (result[0]?.generated_text || result.generated_text)) {
      const text = (result[0]?.generated_text || result.generated_text || '').toLowerCase().trim();
      const words = text
        .split(/[\s,;]+/)
        .filter((w) => w.length > 2)
        .slice(0, 5);
      return words.length > 0 ? words : extractBasicKeywords(query);
    }

    return extractBasicKeywords(query);
  } catch (err) {
    console.error('Keyword extraction error:', err);
    return extractBasicKeywords(query);
  }
}

/**
 * Basic keyword extraction fallback
 */
function extractBasicKeywords(query) {
  const stopWords = new Set([
    'i', 'me', 'my', 'need', 'want', 'looking', 'for', 'a', 'an', 'the',
    'find', 'search', 'get', 'show', 'please', 'can', 'you', 'help',
    'to', 'with', 'in', 'on', 'at', 'by', 'of', 'and', 'or', 'is',
  ]);

  return query
    .toLowerCase()
    .split(/[\s,;!?]+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 5);
}

/**
 * Detect user intent from message
 */
async function detectIntent(userMessage, userRole = 'customer') {
  try {
    const intents = getIntentsForRole(userRole);

    const result = await callHuggingFace(MODELS.CLASSIFICATION, {
      inputs: userMessage,
      parameters: {
        candidate_labels: intents,
      },
    });

    if (result?.labels?.[0]) {
      return result.labels[0];
    }

    return 'general';
  } catch (err) {
    console.error('Intent detection error:', err);
    return 'general';
  }
}

/**
 * Analyze provider performance and generate insights
 */
async function analyzeProviderMetrics(metrics) {
  try {
    const { totalBookings, completedBookings, avgRating, cancellationRate, reviewCount } = metrics;
    const completionRate = totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0;

    const prompt = `Analyze these provider performance metrics briefly (2-3 sentences).
Total Bookings: ${totalBookings}
Completed: ${completedBookings} (${completionRate}%)
Average Rating: ${avgRating}/5 (${reviewCount} reviews)
Cancellation Rate: ${cancellationRate}%
Analysis:`;

    const result = await callHuggingFace(MODELS.TEXT_GEN, { inputs: prompt });

    if (result && (result[0]?.generated_text || result.generated_text)) {
      return cleanResponse(result[0]?.generated_text || result.generated_text);
    }

    return generateDefaultAnalysis(metrics);
  } catch (err) {
    console.error('Metrics analysis error:', err);
    return generateDefaultAnalysis(metrics);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRoleContext(role) {
  const contexts = {
    customer: 'customers book appointments, find providers, and manage their bookings',
    provider: 'providers manage their appointments, schedules, slots, and view reviews',
    admin: 'admins manage the system, monitor activities, and view analytics',
  };
  return contexts[role] || contexts.customer;
}

function getIntentsForRole(role) {
  const intents = {
    customer: ['booking', 'search providers', 'reschedule', 'cancel', 'view profile', 'general help'],
    provider: ['manage schedule', 'view bookings', 'update profile', 'check reviews', 'general help'],
    admin: ['system analytics', 'user management', 'provider performance', 'reports', 'general help'],
  };
  return intents[role] || intents.customer;
}

function getSmartFallbackResponse(message, role) {
  const msgLower = (message || '').toLowerCase();

  // Customer smart responses
  if (role === 'customer') {
    if (msgLower.includes('book') || msgLower.includes('appointment')) {
      return 'To book an appointment, go to "Browse Providers", select a provider, choose an available time slot, and confirm your booking. You\'ll receive an email confirmation.';
    }
    if (msgLower.includes('cancel')) {
      return 'To cancel an appointment, go to "My Appointments", find the appointment you want to cancel, and click the "Cancel" button. You\'ll receive a confirmation email.';
    }
    if (msgLower.includes('reschedule')) {
      return 'To reschedule, go to "My Appointments", click "Reschedule" on your appointment, and select a new available time slot.';
    }
    if (msgLower.includes('doctor') || msgLower.includes('dentist') || msgLower.includes('specialist')) {
      return 'You can search for providers by going to "Browse Providers" and using the search bar. Try typing a specialty or domain to find the right provider for you.';
    }
    if (msgLower.includes('review') || msgLower.includes('rating')) {
      return 'You can leave a review after a completed appointment. Go to "My Appointments" and find your completed appointments to submit feedback.';
    }
  }

  // Provider smart responses
  if (role === 'provider') {
    if (msgLower.includes('slot') || msgLower.includes('schedule')) {
      return 'To manage your slots, go to "Manage Slots". You can add new time slots, edit existing ones, or delete unbooked slots. Maximum 15 slots per day.';
    }
    if (msgLower.includes('booking') || msgLower.includes('appointment')) {
      return 'Check your appointments in the "Appointments" section. You\'ll see today\'s bookings, upcoming ones, and can mark them as completed.';
    }
    if (msgLower.includes('review') || msgLower.includes('rating')) {
      return 'View your reviews and ratings in the "Reviews" section. Your average rating and customer feedback are displayed there.';
    }
  }

  // Admin smart responses
  if (role === 'admin') {
    if (msgLower.includes('user') || msgLower.includes('suspend')) {
      return 'Manage users in the "Users" section. You can view all registered users, suspend or unsuspend accounts as needed.';
    }
    if (msgLower.includes('reset') || msgLower.includes('system')) {
      return 'System reset is available in "Reset System". This will clear all appointments, slots, and reviews but preserve user accounts. Requires password confirmation.';
    }
    if (msgLower.includes('cancel') || msgLower.includes('trend')) {
      return 'View cancelled appointments in the "Cancelled Appointments" section. The dashboard shows cancellation rates and trends.';
    }
  }

  return getDefaultChatResponse(role);
}

function getDefaultChatResponse(role) {
  const responses = {
    customer:
      "Hello! I can help you book appointments, search for providers, reschedule, or manage your bookings. What would you like to do?",
    provider:
      "Hello! I can help you manage appointments, view bookings, update your profile, or check reviews. How can I assist?",
    admin:
      "Hello! I can help with system analytics, user management, performance metrics, and reports. What do you need?",
  };
  return responses[role] || responses.customer;
}

function getDefaultEmailBody(userName, providerName, date, time, action) {
  const templates = {
    confirmed: `Dear ${userName},\n\nYour appointment with ${providerName} has been confirmed for ${date} at ${time}.\n\nPlease arrive on time. If you need to reschedule or cancel, you can do so through your dashboard.\n\nBest regards,\nSmart Appointment Team`,
    cancelled: `Dear ${userName},\n\nYour appointment with ${providerName} on ${date} at ${time} has been cancelled.\n\nIf you'd like to reschedule, please feel free to book another time slot through our platform.\n\nBest regards,\nSmart Appointment Team`,
    rescheduled: `Dear ${userName},\n\nYour appointment with ${providerName} has been rescheduled to ${date} at ${time}.\n\nPlease note the new date and time. Thank you for your flexibility!\n\nBest regards,\nSmart Appointment Team`,
  };
  return templates[action] || templates.confirmed;
}

function generateDefaultAnalysis(metrics) {
  const { avgRating, cancellationRate } = metrics;
  let analysis = 'Provider Performance Summary: ';

  if (avgRating >= 4.5) analysis += 'Excellent ratings indicate high customer satisfaction. ';
  else if (avgRating >= 3.5) analysis += 'Good ratings showing consistent service quality. ';
  else if (avgRating > 0) analysis += 'Below average ratings suggest areas for improvement. ';
  else analysis += 'No ratings yet. ';

  if (cancellationRate < 5) analysis += 'Low cancellation rate reflects reliable service. ';
  else if (cancellationRate < 15) analysis += 'Moderate cancellation rate - monitor for patterns. ';
  else if (cancellationRate > 0) analysis += 'High cancellation rate requires attention. ';

  analysis += 'Continue monitoring metrics for improvement opportunities.';
  return analysis;
}

function cleanResponse(text) {
  if (!text) return '';
  return text
    .replace(/^(Assistant|AI|Response|Answer|Email|Keywords|Analysis|Intent):\s*/gi, '')
    .replace(/[*_`]/g, '')
    .trim()
    .substring(0, 1000);
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // AI Features
  chat,
  recommendProviders,
  generateEmailBody,
  generateProfileKeywords,
  extractSearchKeywords,

  // Helper AI functions
  detectIntent,
  analyzeProviderMetrics,

  // Exported config
  MODELS,
  callHuggingFace,
};
