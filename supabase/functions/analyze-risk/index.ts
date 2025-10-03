import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { articles } = await req.json();
    
    if (!articles || !Array.isArray(articles)) {
      throw new Error('Invalid articles data');
    }

    console.log(`Analyzing ${articles.length} articles`);

    const analyzedArticles = [];

    for (const article of articles) {
      try {
        const title = article.title || '';
        const description = article.description || '';
        const content = article.content || '';
        
        const fullText = `${title} ${description} ${content}`.substring(0, 3000);

        const prompt = `You are a professional risk analyst for Tata Motors. Analyze the following news article and classify its risk.

Title: ${title}
Content: ${fullText}

For this article, provide the following fields:
- Risk_Type: Supply Chain / Strategic / None
- Severity: High / Medium / Low / None
- Affected_Nodes: List of relevant entities mentioned (e.g., lithium, battery, chip, vendor, EV policy, cybersecurity, production, logistics, competitor)
- Explanation: Short reasoning for your classification (max 100 words)
- Risk_Score: A numerical score from 0 to 10 representing the risk level

Requirements:
- Focus on risks relevant to Tata Motors as an automotive company
- Supply Chain risks: Issues affecting suppliers, materials, logistics, production, cybersecurity
- Strategic risks: Policy changes, market shifts, competitive threats, regulatory changes
- Affected_Nodes should be specific entities from this list: chip, battery, vendor, ev_policy, cybersecurity, production, logistics, competitor
- Risk_Score: High severity = 7-10, Medium = 4-6, Low = 1-3, None = 0-1

Output ONLY a valid JSON object in this exact format:
{
    "Risk_Type": "Supply Chain|Strategic|None",
    "Severity": "High|Medium|Low|None",
    "Affected_Nodes": ["node1", "node2"],
    "Explanation": "Brief explanation",
    "Risk_Score": 0.0
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            }
          }),
        });

        if (!geminiResponse.ok) {
          console.error('Gemini API error:', await geminiResponse.text());
          throw new Error('Gemini API error');
        }

        const geminiData = await geminiResponse.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        let analysis;
        
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback analysis
          analysis = {
            Risk_Type: "None",
            Severity: "None",
            Affected_Nodes: [],
            Explanation: "Unable to analyze",
            Risk_Score: 0
          };
        }

        analyzedArticles.push({
          Title: title,
          Source: article.source?.name || 'Unknown',
          PublishedAt: article.publishedAt,
          Url: article.url,
          ...analysis
        });

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error analyzing article "${article.title}":`, error);
        // Add article with default values if analysis fails
        analyzedArticles.push({
          Title: article.title || 'Unknown',
          Source: article.source?.name || 'Unknown',
          PublishedAt: article.publishedAt,
          Url: article.url,
          Risk_Type: "None",
          Severity: "None",
          Affected_Nodes: [],
          Explanation: "Analysis failed",
          Risk_Score: 0
        });
      }
    }

    console.log(`Successfully analyzed ${analyzedArticles.length} articles`);

    return new Response(JSON.stringify(analyzedArticles), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-risk:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
