import { NextRequest } from 'next/server';

const ENGINE_URL = process.env.ENGINE_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
  const { spec } = await request.json();

  if (!spec || typeof spec !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing spec' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Proxy to the real build engine
    const engineResponse = await fetch(`${ENGINE_URL}/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec }),
    });

    if (!engineResponse.ok) {
      const error = await engineResponse.text();
      return new Response(
        JSON.stringify({ error: `Engine error: ${error}` }),
        { status: engineResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!engineResponse.body) {
      return new Response(
        JSON.stringify({ error: 'No stream from engine' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream SSE from engine to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = engineResponse.body!.getReader();
        const encoder = new TextEncoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    // Engine not reachable — return helpful error
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            error: `Build engine not reachable at ${ENGINE_URL}. Make sure the engine is running.` 
          })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
