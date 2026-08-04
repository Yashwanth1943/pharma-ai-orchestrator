const Groq = require('groq-sdk');

// Initialize conditionally
let ai = null;
try {
  if (process.env.GROQ_API_KEY) {
    ai = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
} catch (error) {
  console.warn("Groq API not initialized. Check GROQ_API_KEY.");
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
  },
  required: ['title', 'explanation', 'recommendation', 'reason', 'confidence', 'priority', 'nextStep']
};

const writingAssistSchema = {
  type: "object",
  properties: {
    enhancedText: { type: "string" },
    explanation: { type: "string" }
  },
  required: ['enhancedText', 'explanation']
};

// Helper for graceful fallback
const generateAIResponse = async (prompt, schema = aiResponseSchema) => {
  if (!ai) {
    return JSON.stringify({
      title: "AI Offline",
      explanation: "AI Assistant is currently unavailable due to missing API key.",
      recommendation: "Please contact system administrator.",
      reason: "Missing configuration.",
      confidence: 0,
      priority: "High",
      nextStep: "Configure GROQ_API_KEY",
      enhancedText: "AI is offline.",
    });
  }
  
  try {
    const response = await ai.chat.completions.create({
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
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });
    
    const responseText = response.choices[0]?.message?.content || '{}';
    
    // Attempt to parse to ensure it's valid JSON before returning
    JSON.parse(responseText);
    return responseText;
  } catch (error) {
    console.error("AI Generation Error:", error);
    if (error.status === 429) {
      return JSON.stringify({
        title: "AI Rate Limit Reached",
        explanation: "The AI is currently processing too many requests.",
        recommendation: "Please wait a few seconds and try again.",
        reason: "API Quota Exceeded (429)",
        confidence: 0,
        priority: "High",
        nextStep: "Wait",
        enhancedText: "AI rate limit reached. Please try again in a moment.",
        isRateLimit: true
      });
    }

    return JSON.stringify({
      title: "Generation Failed",
      explanation: "AI encountered an error while processing your request.",
      recommendation: "Try your request again later.",
      reason: "Internal server error during LLM generation.",
      confidence: 0,
      priority: "Medium",
      nextStep: "Retry",
      enhancedText: "Error generating text."
    });
  }
};

// @desc    Get AI insights for a specific context
// @route   POST /api/ai/insights
// @access  Private
const getInsights = async (req, res) => {
  try {
    const { contextType, data, role } = req.body;
    
    let prompt = '';
    let activeSchema = aiResponseSchema;
    
    const systemInstructions = `
      You are an intelligent enterprise assistant for Pharma AI Orchestrator.
      You MUST return data adhering strictly to the JSON schema requested.
    `;
    
    if (contextType === 'writing_assist') {
      activeSchema = writingAssistSchema;
      prompt = `${systemInstructions}
        Context: Writing Assistant for role '${role}'. 
        Action Requested: ${data.action}
        Original Text: "${data.text}"
        
        Task: Perform the requested action on the original text. Maintain an enterprise, professional tone unless "Simplify" is requested. If it's a transition note or complaint, inject pharma-appropriate terminology if helpful.
        Return the "enhancedText" and a brief "explanation" of what you changed.`;
    } else if (contextType === 'customer_portal') {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Customer Portal Order Tracking. Explain the order progress in simple language to the customer, predict delays based on current stage, and suggest next actions.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'production') {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Production Dashboard. Predict manufacturing bottlenecks, recommend production priority, and summarize production activity based on active orders.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'quality_control' || contextType === 'quality_assurance') {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Quality ${contextType === 'quality_control' ? 'Control' : 'Assurance'}. Summarize inspections, detect repeated failures across batches, explain approval decisions, and recommend additional validations.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'warehouse_logistics') {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Warehouse & Logistics. Recommend dispatch priority, predict dispatch/delivery delays, and explain shipment progress.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'complaints') {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Complaint Analysis. Automatically categorize complaints, suggest professional resolutions, and detect sentiment to prioritize urgent issues.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'marketing_outreach') {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Marketing & Outreach. Generate an AI "Next-Best Action" (NBA) strategy for targeting specific customer segments, respecting consent preferences, and predicting campaign success.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'predictive_analytics') {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Predictive Analytics & Intent. Analyze sentiment trends and conversion/churn propensity data to provide strategic insights.
        Data: ${JSON.stringify(data)}`;
    } else if (contextType === 'dashboard') {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        Context: Admin/General Role Dashboard. Provide high-level business insights, department performance, trend analysis, and AI-generated recommendations.
        User Role: ${role}
        Data: ${JSON.stringify(data)}`;
    } else {
      prompt = `${systemInstructions}
        Analyze the provided data based on the user's role and context, and generate a logical explanation, recommendation, and reason.
        General Context: Provide helpful insights for ${role} based on provided data.
        Data: ${JSON.stringify(data)}`;
    }

    const aiText = await generateAIResponse(prompt, activeSchema);
    
    // Return parsed JSON object directly so frontend receives JSON, not a string
    try {
      const jsonResult = JSON.parse(aiText);
      res.json({ result: jsonResult });
    } catch(e) {
      res.status(500).json({ message: "Failed to parse AI output into valid JSON." });
    }
  } catch (err) {
    console.error("Unhandled error in getInsights:", err);
    res.status(500).json({ message: "Server error processing AI insights." });
  }
};

module.exports = { getInsights };
