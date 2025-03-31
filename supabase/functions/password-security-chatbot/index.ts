
// password-security-chatbot/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    const body = await req.json();
    
    // Input validation
    if (!body || typeof body !== 'object') {
      throw new Error("Invalid request body");
    }
    
    const { message, passwordStats } = body;
    
    if (!message || typeof message !== 'string') {
      throw new Error("Message is required and must be a string");
    }
    
    // Validate message length to prevent abuse
    if (message.length > 500) {
      throw new Error("Message is too long (max 500 characters)");
    }

    // Enhanced system prompt for more dynamic, personalized responses
    const systemPrompt = `You are a friendly and helpful AI password security assistant with knowledge about password security best practices and the RockYou data breach containing 14+ million leaked passwords.

    As a password security expert:
    1. Be conversational, friendly, and adapt your tone to the user's query
    2. Always provide unique and varied responses to similar questions - never repeat the exact same advice
    3. When discussing a user's password, carefully analyze the provided passwordStats and tailor your feedback
    4. Generate creative, secure password examples when asked, making each suggestion unique
    5. If the user asks for themed passwords (e.g., related to sports, animals, etc.), create creative examples
    6. Explain complex security concepts in simple terms with relevant analogies
    7. Avoid technical jargon unless specifically asked for expert-level information
    8. Respond with humor and personality when appropriate but stay professional

    Important facts about password security to reference:
    - The most common passwords in the RockYou breach were "123456", "password", "qwerty", "abc123", and "iloveyou"
    - 40.3% of RockYou passwords were purely lowercase letters
    - Only 3.8% used special characters
    - 59.7% were 8 characters or less
    - Less than 4% were 12+ characters long
    - Passwords with personal information are highly vulnerable to targeted attacks
    - Modern password cracking hardware can attempt billions of combinations per second`;

    // Create more personalized user context based on password analysis
    const userContext = passwordStats 
      ? `The user has entered a password with these characteristics:
      - Length: ${passwordStats.length} characters
      - Contains uppercase letters: ${passwordStats.hasUpper ? 'Yes' : 'No'}
      - Contains lowercase letters: ${passwordStats.hasLower ? 'Yes' : 'No'}
      - Contains numbers: ${passwordStats.hasDigit ? 'Yes' : 'No'}
      - Contains special characters: ${passwordStats.hasSpecial ? 'Yes' : 'No'}
      - Password strength score: ${passwordStats.score}/4
      - Estimated time to crack: ${passwordStats.timeToCrack["Brute Force (Offline)"]}
      - Hackability score: ${passwordStats.hackabilityScore ? passwordStats.hackabilityScore.score : 'Not available'}/100
      - Risk level: ${passwordStats.hackabilityScore ? passwordStats.hackabilityScore.riskLevel : 'Not available'}
      
      Attack resistance scores:
      - Brute Force: ${passwordStats.attackResistance ? passwordStats.attackResistance.bruteForce : 'N/A'}/100
      - Dictionary: ${passwordStats.attackResistance ? passwordStats.attackResistance.dictionary : 'N/A'}/100
      - Pattern-Based: ${passwordStats.attackResistance ? passwordStats.attackResistance.patternBased : 'N/A'}/100
      - AI Attack: ${passwordStats.attackResistance ? passwordStats.attackResistance.aiAttack : 'N/A'}/100
      
      When answering, refer to these specifics and address any issues with their current password.`
      : "The user hasn't provided a password for analysis yet.";

    console.log("Sending request to OpenAI with API key:", OPENAI_API_KEY ? "API key is set" : "API key is NOT set");
    console.log("Request details:", { hasMessage: !!message, hasPasswordStats: !!passwordStats });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContext + "\n\n" + message }
        ],
        temperature: 0.8, // Increased for more varied responses
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    const chatbotResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response at this time.";

    console.log("Chat request:", { passwordStats: passwordStats ? "provided" : "not provided", userMessage: message });
    console.log("Response length:", chatbotResponse.length);

    return new Response(JSON.stringify({ 
      response: chatbotResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in password security chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: `Error: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
