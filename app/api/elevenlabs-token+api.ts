export async function POST(req: Request) {
  // Validate ElevenLabs API key
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY environment variable is not set');
    return new Response(
      JSON.stringify({ error: 'ElevenLabs API key not configured' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Get agent_id from request body
    const body = await req.json();
    const agentId = body.agentId;
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'Agent ID is required' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('myapi Getting conversation token for agentId:', agentId);
    console.log('myapi API key exists:', !!process.env.ELEVENLABS_API_KEY);

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Get conversation token from ElevenLabs with agent_id
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('myapi Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('myapi ElevenLabs API error:', response.status, response.statusText, errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to get conversation token',
            details: errorText,
            status: response.status 
          }), 
          { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const tokenData = await response.json();
      console.log('myapi Token received successfully');
      
      return new Response(
        JSON.stringify({ token: tokenData.token }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('myapi Fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            error: 'Request timeout',
            message: 'ElevenLabs API request timed out after 10 seconds'
          }), 
          { 
            status: 408,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw fetchError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('myapi Token API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}