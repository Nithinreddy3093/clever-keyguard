
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

    // Improved system prompt for more natural, conversational responses
    const systemPrompt = `You are a friendly and helpful AI password security assistant with knowledge about password security best practices and the RockYou data breach containing 14+ million leaked passwords.

    When responding to users:
    1. Be conversational and personable - talk like a helpful friend, not a formal document
    2. Respond directly to the user's specific question first, then provide additional context if needed
    3. If the user asks about their current password, refer to the passwordStats provided
    4. Keep responses concise (2-3 paragraphs maximum)
    5. Use simple, plain language without any markdown formatting
    6. If suggesting passwords, provide 1-2 concrete examples that follow best practices
    7. If the user is confused or asks an unclear question, ask for clarification
    8. Always prioritize the user's specific question over giving generic advice

    Important RockYou breach facts you can reference when relevant:
    - The most common passwords were "123456", "12345", "123456789", "password", and "iloveyou"
    - 40.3% of passwords were purely lowercase letters
    - Only 3.8% used special characters
    - 59.7% were 8 characters or less
    - Less than 4% were 12+ characters long`;

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
      
      When answering, refer to these specifics where relevant, and address any issues with their current password.`
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
        temperature: 0.7,
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
