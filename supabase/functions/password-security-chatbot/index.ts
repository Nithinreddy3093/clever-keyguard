
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
    const { message, passwordStats } = await req.json();

    // Build a prompt that includes context about password security and RockYou dataset
    const systemPrompt = `You are an AI password security expert. You have knowledge of the RockYou data breach that contained 14,341,564 unique passwords. 
    Use this context to provide specific, actionable advice about password security.
    
    Some facts about the RockYou dataset:
    - The most common password was "123456" (290,000+ occurrences)
    - Common patterns included names followed by numbers (e.g., "john123")
    - Many passwords used simple keyboard patterns like "qwerty"
    - Short passwords (less than 8 characters) made up over 50% of the dataset
    - Only 4% of passwords used special characters
    
    When giving advice:
    1. Be specific and practical
    2. Explain why certain practices are risky
    3. Suggest concrete improvements
    4. Use examples from the RockYou breach when relevant
    5. Be conversational but informative`;

    const userContext = passwordStats 
      ? `The user's current password has the following characteristics: ${JSON.stringify(passwordStats)}. Consider these details in your response.`
      : "";

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
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    const chatbotResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response at this time.";

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
