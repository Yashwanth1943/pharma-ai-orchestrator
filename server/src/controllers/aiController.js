const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const AIFeedback = require('../models/AIFeedback');

// Initialize conditionally
let groqAi = null;
let geminiAi = null;

try {
  if (process.env.GROQ_API_KEY) {
    groqAi = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
} catch (error) {
  console.warn("Groq API not initialized. Check GROQ_API_KEY.");
}

try {
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiAi = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
  }
} catch (error) {
  console.warn("Gemini API not initialized. Check GEMINI_API_KEY.");
}

// Define strict JSON schemas for general insights
const aiResponseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    explanation: { type: "string" },
    recommendation: { type: "string" },
    reason: { type: "string" },
    confidence: { type: "number" },
    priority: { type: "string" },
    nextStep: { type: "string" },
    modelVersion: { type: "string" },
    timestamp: { type: "string" }
  },
  required: ['title', 'explanation', 'recommendation', 'reason', 'confidence', 'priority', 'nextStep', 'modelVersion', 'timestamp']
};

const writingAssistSchema = {
  type: "object",
  properties: {
    enhancedText: { type: "string" },
    explanation: { type: "string" },
    modelVersion: { type: "string" },
    timestamp: { type: "string" }
  },
  required: ['enhancedText', 'explanation', 'modelVersion', 'timestamp']
};

// Helper for graceful fallback and dual AI execution
const generateAIResponse = async (prompt, schema = aiResponseSchema, contextType = 'general', userId, userRole) => {
  let responseText = null;
  let usedModel = 'None';
  let jsonResult = null;

  const systemInstructions = `You are an intelligent enterprise assistant. You MUST respond with a valid JSON object matching this schema: ${JSON.stringify(schema)}. Include current ISO string for timestamp, and the model name for modelVersion.`;
  const fullPrompt = `${systemInstructions}\n\nUser Request:\n${prompt}`;

  // Attempt Gemini first (Primary)
  if (geminiAi) {
    try {
      const result = await geminiAi.generateContent(fullPrompt);
      responseText = result.response.text();
      usedModel = 'Gemini 1.5 Flash';
    } catch (e) {
      console.warn("Gemini generation failed, falling back to Groq:", e.message);
    }
  }

  // Fallback to Groq
  if (!responseText && groqAi) {
    try {
      const response = await groqAi.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an intelligent enterprise assistant. You MUST respond with a valid JSON object matching this schema: ${JSON.stringify(schema)}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });
      responseText = response.choices[0]?.message?.content || '{}';
      usedModel = 'Llama 3.3 70B (Groq)';
    } catch (e) {
      console.warn("Groq generation failed:", e.message);
      if (e.status === 429) {
        return {
          title: "AI Rate Limit Reached",
          explanation: "The AI is currently processing too many requests.",
          recommendation: "Please wait a few seconds and try again.",
          reason: "API Quota Exceeded (429)",
          confidence: 0,
          priority: "High",
          nextStep: "Wait",
          enhancedText: "AI rate limit reached. Please try again in a moment.",
          modelVersion: "Fallback",
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  if (!responseText) {
    return {
      title: "AI Offline",
      explanation: "AI Assistant is currently unavailable due to missing API keys or service outages.",
      recommendation: "Please contact system administrator.",
      reason: "Missing configuration.",
      confidence: 0,
      priority: "High",
      nextStep: "Configure API Keys",
      enhancedText: "AI is offline.",
      modelVersion: "Fallback",
      timestamp: new Date().toISOString()
    };
  }

  try {
    jsonResult = JSON.parse(responseText);
    // Ensure modelVersion and timestamp are injected if AI missed it
    jsonResult.modelVersion = jsonResult.modelVersion || usedModel;
    jsonResult.timestamp = jsonResult.timestamp || new Date().toISOString();
  } catch (e) {
    console.error("Failed to parse AI output into valid JSON:", e);
    return { title: "Generation Failed", explanation: "AI returned invalid JSON.", modelVersion: usedModel, timestamp: new Date().toISOString() };
  }

  // Log to AIFeedback collection for outcome tracking
  try {
    await AIFeedback.create({
      contextType,
      model: usedModel,
      promptSnapshot: { prompt },
      aiResponse: jsonResult,
      userId,
      userRole
    });
  } catch (err) {
    console.error("Failed to log AI feedback snapshot:", err);
  }

  return jsonResult;
};

// @desc    Get AI insights for a specific context
// @route   POST /api/ai/insights
// @access  Private
const getInsights = async (req, res) => {
  try {
    const { contextType, data, role } = req.body;
    
    let prompt = '';
    let activeSchema = aiResponseSchema;
    
    if (contextType === 'writing_assist') {
      activeSchema = writingAssistSchema;
      prompt = `Context: Writing Assistant for role '${role}'. 
        Action Requested: ${data.action}
        Original Text: "${data.text}"
        Task: Perform the requested action on the original text. Maintain an enterprise, professional tone. Return the "enhancedText" and a brief "explanation" of what you changed.`;
    } else if (contextType === 'customer_portal') {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Customer Portal Order Tracking. Explain the order progress in simple language to the customer, predict delays based on current stage, and suggest next actions.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'production') {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Production Dashboard. Predict manufacturing bottlenecks, recommend production priority, and summarize production activity based on active orders.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'quality_control' || contextType === 'quality_assurance') {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Quality ${contextType === 'quality_control' ? 'Control' : 'Assurance'}. Summarize inspections, detect repeated failures across batches, explain approval decisions, and recommend additional validations.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'warehouse_logistics') {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Warehouse & Logistics. Recommend dispatch priority, predict dispatch/delivery delays, and explain shipment progress.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'complaints') {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Complaint Analysis. Automatically categorize complaints, suggest professional resolutions, and detect sentiment to prioritize urgent issues.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'marketing_outreach') {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Marketing & Outreach. Generate an AI "Next-Best Action" (NBA) strategy for targeting specific customer segments, respecting consent preferences, and predicting campaign success.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'predictive_analytics') {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Predictive Analytics & Intent. Analyze sentiment trends and conversion/churn propensity data to provide strategic insights.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'dashboard') {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Admin/General Role Dashboard. Provide high-level business insights, department performance, trend analysis, and AI-generated recommendations.
        User Role: ${role}
        Data: ${JSON.stringify(data)}`;
    } else {
      prompt = `Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        General Context: Provide helpful insights for ${role} based on provided data.
        Data: ${JSON.stringify(data)}`;
    }

    const jsonResult = await generateAIResponse(prompt, activeSchema, contextType, req.user._id, req.user.role);
    res.json({ result: jsonResult });
  } catch (err) {
    console.error("Unhandled error in getInsights:", err);
    res.status(500).json({ message: "Server error processing AI insights." });
  }
};

// @desc    Submit AI feedback (thumbs up/down or override)
// @route   POST /api/ai/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { feedbackId, feedback, correction, outcome } = req.body;
    let record;
    
    // If feedbackId provided, update existing record
    if (feedbackId) {
      record = await AIFeedback.findById(feedbackId);
      if (record) {
        if (feedback) record.feedback = feedback;
        if (correction) record.correction = correction;
        if (outcome) record.outcome = outcome;
        await record.save();
        return res.json({ message: "Feedback updated", record });
      }
    }
    
    // If no feedbackId, we might create a standalone feedback event (or client might search by most recent)
    // For simplicity, we assume client just passes feedbackId or we do generic creation.
    record = await AIFeedback.create({
      contextType: req.body.contextType || 'general',
      model: req.body.model || 'Unknown',
      feedback,
      correction,
      outcome,
      userId: req.user._id,
      userRole: req.user.role
    });
    
    res.status(201).json({ message: "Feedback submitted", record });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get AI feedback history for model recalibration
// @route   GET /api/ai/feedback
// @access  Private (Admin/Marketing/Sales)
const getFeedbackHistory = async (req, res) => {
  try {
    const feedbacks = await AIFeedback.find().sort({ createdAt: -1 }).limit(100).populate('userId', 'name');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = { getInsights, submitFeedback, getFeedbackHistory };
