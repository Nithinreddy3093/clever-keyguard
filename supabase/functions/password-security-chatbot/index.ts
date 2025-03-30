
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

    // Enhanced system prompt with more detailed RockYou dataset insights
    const systemPrompt = `You are an AI password security expert with extensive knowledge of the RockYou data breach containing 14,341,564 unique passwords. 
    
    Detailed facts about the RockYou dataset:
    - The most common password was "123456" (290,731 occurrences)
    - The second most common was "12345" (79,076 occurrences)
    - "123456789" was third (59,462 occurrences)
    - "password" was fourth (59,184 occurrences)
    - "iloveyou" was fifth (49,952 occurrences)
    - Common patterns included:
      - Simple keyboard walks ("qwerty", "asdfgh")
      - Sequential numbers ("123456", "12345")
      - Common words ("password", "monkey", "shadow")
      - Names followed by numbers ("michael1", "ashley1")
      - Sports teams and popular culture references
    - 40.3% of passwords were purely lowercase letters
    - 16.8% were purely numbers
    - Only 3.8% of passwords used special characters
    - 59.7% of passwords were 8 characters or less
    - Less than 4% were 12 characters or longer
    
    When giving advice:
    1. Be specific and actionable
    2. Explain exactly why certain patterns are problematic using RockYou statistics
    3. Suggest concrete improvements with examples
    4. Relate advice to real-world breach statistics when relevant
    5. Be conversational but informative
    6. If you see a vulnerability, always explain it in the context of how attackers would exploit it`;

    const userContext = passwordStats 
      ? `The user's current password has the following characteristics: ${JSON.stringify(passwordStats)}. 
      Based on this analysis, identify specific vulnerabilities and suggest targeted improvements.`
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
        max_tokens: 800,
      }),
    });

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
