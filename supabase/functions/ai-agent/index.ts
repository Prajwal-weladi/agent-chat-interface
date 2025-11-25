import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DuckDuckGo search function
async function webSearch(query: string): Promise<string> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    
    let results = "";
    if (data.AbstractText) {
      results += `Summary: ${data.AbstractText}\n`;
    }
    if (data.AbstractURL) {
      results += `Source: ${data.AbstractURL}\n`;
    }
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      results += "\nRelated Information:\n";
      data.RelatedTopics.slice(0, 3).forEach((topic: any, idx: number) => {
        if (topic.Text) {
          results += `${idx + 1}. ${topic.Text}\n`;
          if (topic.FirstURL) {
            results += `   Source: ${topic.FirstURL}\n`;
          }
        }
      });
    }
    
    return results || "No search results found.";
  } catch (error) {
    console.error("Web search error:", error);
    return "Unable to perform web search at this time.";
  }
}

// Yahoo Finance function to get stock data
async function getStockData(symbol: string): Promise<string> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return `Unable to fetch data for ${symbol}`;
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    
    let output = `**Stock Data for ${symbol}**\n\n`;
    output += `| Metric | Value |\n`;
    output += `|--------|-------|\n`;
    output += `| Current Price | $${meta.regularMarketPrice?.toFixed(2) || 'N/A'} |\n`;
    output += `| Previous Close | $${meta.previousClose?.toFixed(2) || 'N/A'} |\n`;
    output += `| Day High | $${quote.high?.[0]?.toFixed(2) || 'N/A'} |\n`;
    output += `| Day Low | $${quote.low?.[0]?.toFixed(2) || 'N/A'} |\n`;
    output += `| Volume | ${quote.volume?.[0]?.toLocaleString() || 'N/A'} |\n`;
    
    const change = meta.regularMarketPrice - meta.previousClose;
    const changePercent = (change / meta.previousClose) * 100;
    output += `| Change | ${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercent.toFixed(2)}%) |\n`;
    
    return output;
  } catch (error) {
    console.error("Stock data error:", error);
    return `Unable to fetch stock data for ${symbol}`;
  }
}

// Main agent logic
async function processQuery(
  query: string, 
  conversationHistory: any[],
  agentInstructions: string
): Promise<ReadableStream> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }

  // Determine if we need to use tools based on query content
  const needsStockData = /\b[A-Z]{1,5}\b/.test(query) && 
    (query.toLowerCase().includes('stock') || 
     query.toLowerCase().includes('price') || 
     query.toLowerCase().includes('analyst') ||
     query.toLowerCase().includes('recommendation') ||
     query.toLowerCase().includes('fundamental'));
     
  const needsWebSearch = query.toLowerCase().includes('news') || 
    query.toLowerCase().includes('search') ||
    query.toLowerCase().includes('latest') ||
    query.toLowerCase().includes('recent') ||
    query.toLowerCase().includes('what') ||
    query.toLowerCase().includes('who') ||
    query.toLowerCase().includes('when') ||
    query.toLowerCase().includes('how');

  // Build context from tools
  let toolContext = "";
  
  if (needsStockData) {
    const symbolMatch = query.match(/\b([A-Z]{1,5})\b/);
    if (symbolMatch) {
      const symbol = symbolMatch[1];
      console.log(`Fetching stock data for ${symbol}`);
      const stockData = await getStockData(symbol);
      toolContext += `\n\n**Stock Data Retrieved:**\n${stockData}\n`;
    }
  }
  
  if (needsWebSearch) {
    console.log(`Performing web search for: ${query}`);
    const searchResults = await webSearch(query);
    toolContext += `\n\n**Web Search Results:**\n${searchResults}\n`;
  }

  // Build messages for Groq
  const systemPrompt = agentInstructions || 
    "You are a helpful AI agent. Provide accurate, detailed, and well-structured responses. Use tables for structured data when appropriate and always cite sources when available.";

  const messages = [
    {
      role: "system",
      content: `${systemPrompt}

${toolContext ? `You have retrieved the following data for the current query:\n${toolContext}\n\nUse this data to answer the user's question accurately.` : ''}`
    },
    ...conversationHistory,
    {
      role: "user",
      content: query
    }
  ];

  console.log("Sending request to Groq API...");
  
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Groq API error:", error);
    throw new Error(`Groq API error: ${error}`);
  }

  // Create a transform stream to convert Groq's SSE format to our format
  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            continue;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }
    },
  });

  return response.body!.pipeThrough(transformStream);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, conversationHistory = [], agentInstructions = "" } = await req.json();
    
    if (!query) {
      throw new Error("Query is required");
    }

    console.log("Processing query:", query);
    const stream = await processQuery(query, conversationHistory, agentInstructions);

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in ai-agent function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
