const FITNESS_BASE_URL = 'https://mod.partynet.serv.si';

// Simple in-memory cache for downloaded tracks (expires after 1 hour)
const trackCache = new Map<string, { buffer: Buffer; timestamp: number; contentType: string }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// SIMPLE: Just track if we're downloading
const currentlyDownloading = new Set<string>();

export async function GET(request: Request, { trackId }: { trackId: string }): Promise<Response> {
  try {
    console.log('[Fitness Proxy] === NEW REQUEST ===');
    console.log('[Fitness Proxy] Proxying audio for track:', trackId);
    
    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Get range header if present (for seeking/streaming)
    const rangeHeader = request.headers.get('range');
    
    console.log('[Fitness Proxy] Range header:', rangeHeader);
    console.log('[Fitness Proxy] Request URL:', request.url);

    // Check cache first
    const cached = trackCache.get(trackId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[Fitness Proxy] Using cached track');
      
      // Handle range request on cached buffer
      let responseBuffer = cached.buffer;
      let status = 200;
      let contentRangeHeader = '';

      if (rangeHeader) {
        const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = rangeMatch[2] ? Math.min(parseInt(rangeMatch[2]), cached.buffer.length - 1) : cached.buffer.length - 1;
          
          responseBuffer = cached.buffer.subarray(start, end + 1);
          status = 206;
          contentRangeHeader = `bytes ${start}-${end}/${cached.buffer.length}`;
          
          console.log('[Fitness Proxy] Serving cached range:', contentRangeHeader);
        }
      }

      const responseHeaders: Record<string, string> = {
        'Content-Type': cached.contentType,
        'Content-Length': responseBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      };

      if (contentRangeHeader) {
        responseHeaders['Content-Range'] = contentRangeHeader;
      }

      return new Response(responseBuffer, { status, headers: responseHeaders });
    }

    // If already downloading, just wait and return error for now
    if (currentlyDownloading.has(trackId)) {
      console.log('[Fitness Proxy] Already downloading, returning 503');
      return new Response('Service temporarily unavailable - downloading', { status: 503 });
    }

    // Start download
    currentlyDownloading.add(trackId);
    console.log('[Fitness Proxy] Starting download of complete file in chunks...');
    
    try {
      // Get first chunk to determine total size
      const firstResponse = await fetch(`${FITNESS_BASE_URL}/fitness/file/${trackId}`, {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Range': 'bytes=0-1048575', // First 1MB
        },
      });

      if (!firstResponse.ok) {
        throw new Error(`API error: ${firstResponse.status} ${firstResponse.statusText}`);
      }

      const firstData = await firstResponse.json();
      const contentRange = firstData.headers?.['Content-Range']?.[0];
      const totalSize = contentRange ? parseInt(contentRange.split('/')[1]) : 0;

      if (!totalSize || !firstData.entity) {
        throw new Error('No audio data found');
      }

      console.log('[Fitness Proxy] Total file size:', totalSize, 'bytes');

      // Download all chunks in parallel
      const chunks: Array<{ index: number, entity: string }> = [
        { index: 0, entity: firstData.entity }
      ];

      const chunkPromises: Promise<{ index: number, entity: string }>[] = [];
      let chunkIndex = 1;
      
      for (let start = 1048576; start < totalSize; start += 1048576) {
        const end = Math.min(start + 1048575, totalSize - 1);
        const currentIndex = chunkIndex++;
        
        chunkPromises.push(
          fetch(`${FITNESS_BASE_URL}/fitness/file/${trackId}`, {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/json',
              'Range': `bytes=${start}-${end}`,
            },
          })
          .then(res => res.json())
          .then(data => ({ index: currentIndex, entity: data.entity || '' }))
          .catch(() => ({ index: currentIndex, entity: '' }))
        );
      }

      // Wait for all chunks
      const additionalChunks = await Promise.all(chunkPromises);
      chunks.push(...additionalChunks);

      // Sort and combine chunks
      chunks.sort((a, b) => a.index - b.index);
      const base64Chunks = chunks.map(chunk => chunk.entity).filter(entity => entity.length > 0);

      // Decode chunks and truncate to proper sizes
      console.log('[Fitness Proxy] Decoding and truncating chunks to proper sizes...');
      
      const binaryChunks: Buffer[] = [];
      let bytesProcessed = 0;
      
      for (let i = 0; i < base64Chunks.length; i++) {
        const chunk = base64Chunks[i];
        if (!chunk) continue;
        
        try {
          const decodedChunk = Buffer.from(chunk, 'base64');
          
          // Calculate how many bytes we actually need from this chunk
          const chunkStart = i * 1048576;
          const chunkEnd = Math.min(chunkStart + 1048576, totalSize);
          const bytesNeeded = chunkEnd - chunkStart;
          
          // Only take the bytes we need (API returns full 1MB even for partial chunks)
          const truncatedChunk = decodedChunk.subarray(0, bytesNeeded);
          binaryChunks.push(truncatedChunk);
          bytesProcessed += truncatedChunk.length;
          
          console.log(`[Fitness Proxy] Chunk ${i + 1}: took ${bytesNeeded} bytes of ${decodedChunk.length} (total: ${bytesProcessed})`);
        } catch (e) {
          console.warn('[Fitness Proxy] Invalid base64 chunk:', i);
        }
      }

      const completeBuffer = Buffer.concat(binaryChunks);
      
      console.log('[Fitness Proxy] Assembled complete file:', {
        chunks: base64Chunks.length,
        finalSize: completeBuffer.length,
        expectedSize: totalSize
      });

      const contentType = firstData.headers?.['Content-Type']?.[0] || 'audio/mpeg';
      
      // Cache the complete buffer
      trackCache.set(trackId, {
        buffer: completeBuffer,
        timestamp: Date.now(),
        contentType: contentType
      });
      console.log('[Fitness Proxy] Cached track for future requests');

      // Handle range request on complete buffer
      let responseBuffer = completeBuffer;
      let status = 200;
      let contentRangeHeader = '';

      if (rangeHeader) {
        const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = rangeMatch[2] ? Math.min(parseInt(rangeMatch[2]), completeBuffer.length - 1) : completeBuffer.length - 1;
          
          responseBuffer = completeBuffer.subarray(start, end + 1);
          status = 206;
          contentRangeHeader = `bytes ${start}-${end}/${completeBuffer.length}`;
          
          console.log('[Fitness Proxy] Serving range:', contentRangeHeader);
        }
      }

      // Create response headers
      const responseHeaders: Record<string, string> = {
        'Content-Type': contentType,
        'Content-Length': responseBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      };

      if (contentRangeHeader) {
        responseHeaders['Content-Range'] = contentRangeHeader;
      }

      return new Response(responseBuffer, { status, headers: responseHeaders });

    } finally {
      // Always remove from downloading set
      currentlyDownloading.delete(trackId);
    }

  } catch (error) {
    console.error('[Fitness Proxy] Error:', error);
    
    // Clean up
    currentlyDownloading.delete(trackId);
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}