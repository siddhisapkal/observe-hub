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
    const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY');
    
    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY not configured');
    }

    const { query, pageSize = 20 } = await req.json();
    
    // Default to Tata Motors related news
    const searchQuery = query || 'Tata Motors OR automotive OR electric vehicle OR supply chain';
    
    console.log('Fetching news with query:', searchQuery);

    // Fetch from NewsAPI
    const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&pageSize=${pageSize}&sortBy=publishedAt&language=en`;
    
    const response = await fetch(newsUrl, {
      headers: {
        'X-Api-Key': NEWS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NewsAPI error:', response.status, errorText);
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Successfully fetched ${data.articles?.length || 0} articles`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-news:', error);
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
