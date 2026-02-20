const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All AI routes require authentication
router.use(protect);

/**
 * ========================================
 * AI FEATURE 1: CHATBOT
 * ========================================
 * POST /api/ai/chat
 * Conversational AI for customers, providers, and admins
 * 
 * Request body:
 * {
 *   "message": "user's question or message"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "reply": "AI response",
 *     "intent": "booking|search|reschedule|cancel|profile|general",
 *     "role": "customer|provider|admin",
 *     "timestamp": "ISO timestamp"
 *   }
 * }
 */
router.post('/chat', aiController.chat);

/**
 * ========================================
 * AI FEATURE 2: PROVIDER RECOMMENDATION
 * ========================================
 * GET /api/ai/recommend-provider?query=<search_query>
 * Uses AI to semantically match providers based on search intent
 * Scores by keyword matching, ratings, and completion rate
 * 
 * Query params:
 * - query: search keywords (doctor, dentist, consultant, etc.)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [{provider objects with ratings and match scores}],
 *   "searchQuery": "user's search",
 *   "totalResults": 15
 * }
 */
router.get('/recommend-provider', aiController.recommendProvider);

/**
 * ========================================
 * AI FEATURE 3: EMAIL GENERATOR
 * ========================================
 * POST /api/ai/generate-email
 * Generates professional email content for appointment notifications
 * Used for: confirmation, cancellation, rescheduling, reminders
 * 
 * Request body:
 * {
 *   "userName": "Customer Name",
 *   "providerName": "Provider Name",
 *   "date": "2024-01-15",
 *   "time": "10:00 AM",
 *   "action": "confirmed|cancelled|rescheduled"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "body": "professional email content",
 *     "action": "confirmed",
 *     "recipient": "Customer Name",
 *     "provider": "Provider Name",
 *     "generatedAt": "ISO timestamp"
 *   }
 * }
 */
router.post('/generate-email', aiController.generateEmail);

/**
 * ========================================
 * AI FEATURE 4: KEYWORD GENERATOR
 * ========================================
 * POST /api/ai/generate-keywords
 * Extracts professional keywords from provider profiles
 * Improves searchability and recommendation matching
 * Provider-only access
 * 
 * Request body: {} (no params needed, uses authenticated provider's profile)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "keywords": ["consultation", "telehealth", "experienced", ...],
 *     "profile": { "businessName", "domain", "description" },
 *     "message": "Keywords generated successfully..."
 *   }
 * }
 */
router.post('/generate-keywords', aiController.generateKeywords);

/**
 * ========================================
 * ADMIN: PERFORMANCE ANALYSIS
 * ========================================
 * GET /api/ai/analyze-provider?providerId=<provider_id>
 * AI-generated analysis of provider performance metrics
 * Admin-only access
 * 
 * Query params:
 * - providerId: MongoDB ID of provider to analyze
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "providerId": "...",
 *     "metrics": {
 *       "totalBookings": 45,
 *       "completedBookings": 42,
 *       "avgRating": 4.6,
 *       "cancellationRate": 6.7,
 *       "reviewCount": 30
 *     },
 *     "analysis": "AI-generated performance analysis",
 *     "insights": {
 *       "performanceLevel": "Excellent",
 *       "completionRate": "93.3%",
 *       "recommendation": "..."
 *     }
 *   }
 * }
 */
router.get('/analyze-provider', aiController.analyzeProviderPerformance);

/**
 * ========================================
 * ADMIN: ADVANCED CHAT
 * ========================================
 * POST /api/ai/admin-chat
 * Advanced AI chat with system analytics context
 * Admin-only access for complex queries about the system
 * 
 * Request body:
 * {
 *   "query": "show me insights about the system"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "reply": "AI response with system insights",
 *     "systemContext": {
 *       "totalUsers": 150,
 *       "totalProviders": 30,
 *       "totalAppointments": 500,
 *       "totalReviews": 450
 *     }
 *   }
 * }
 */
router.post('/admin-chat', aiController.adminChat);

/**
 * ========================================
 * HEALTH CHECK
 * ========================================
 * GET /api/ai/health
 * Verify AI service status and Hugging Face configuration
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "aiServiceStatus": "active",
 *     "huggingFaceConfigured": true,
 *     "models": { ... },
 *     "message": "AI service is operational"
 *   }
 * }
 */
router.get('/health', aiController.healthCheck);

module.exports = router;
