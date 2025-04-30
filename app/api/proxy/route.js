export async function GET(request) {
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');
  
  if (!videoUrl) {
    return new Response('URL 파라미터가 필요합니다', {
      status: 400
    });
  }
  
  try {
    const decodedUrl = decodeURIComponent(videoUrl);
    const response = await fetch(decodedUrl);
    
    // 원본 응답의 콘텐츠 타입을 유지
    const contentType = response.headers.get('content-type');
    
    // 콘텐츠 타입에 따라 바이너리/텍스트 응답 처리
    if (decodedUrl.endsWith('.ts') || contentType?.includes('video/') || contentType?.includes('audio/') || contentType?.includes('binary')) {
      // 바이너리 데이터는 arrayBuffer로 처리
      const arrayBuffer = await response.arrayBuffer();
      return new Response(arrayBuffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'video/mp2t',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else {
      // 텍스트 기반 파일
      const body = await response.text();
      let modifiedBody = body;
      
      // m3u8 파일인 경우, 모든 상대 경로를 프록시 URL로 변환
      if (contentType?.includes('application/vnd.apple.mpegurl') || 
          decodedUrl.endsWith('.m3u8')) {
        
        // 비디오 URL의 기본 경로 추출
        const basePath = decodedUrl.substring(0, decodedUrl.lastIndexOf('/') + 1);
        
        // 각 줄을 처리하여 상대 경로를 프록시 URL로 변환
        modifiedBody = body.split('\n').map(line => {
          // .ts 또는 .m3u8 파일 경로가 포함된 줄 처리
          if (line.includes('.ts') || line.includes('.m3u8')) {
            // 절대 경로인 경우
            if (line.startsWith('http')) {
              return line.replace(/(https?:\/\/[^,\s]+)(\.ts|\.m3u8)/g, 
                (match) => `/api/proxy?url=${encodeURIComponent(match)}`);
            } 
            // 상대 경로인 경우 (# 주석이 아닌 경우에만)
            else if (!line.startsWith('#') && (line.includes('.ts') || line.includes('.m3u8'))) {
              const fullUrl = basePath + line.trim();
              return `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
            }
          }
          return line;
        }).join('\n');
      }
      
      // CORS 헤더를 추가하여 응답
      return new Response(modifiedBody, {
        status: response.status,
        headers: {
          'Content-Type': contentType || 
            (decodedUrl.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 
            (decodedUrl.endsWith('.ts') ? 'video/mp2t' : 'application/octet-stream')),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
  } catch (error) {
    console.error('프록시 에러:', error);
    return new Response('비디오 URL을 가져오는 중 오류가 발생했습니다: ' + error.message, {
      status: 500
    });
  }
}

// OPTIONS 요청 처리 (CORS 프리플라이트 요청)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24시간 캐싱
    },
  });
} 