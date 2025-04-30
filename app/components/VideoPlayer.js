'use client';

import { useRef, useState, useEffect } from 'react';
import Script from 'next/script';

export default function VideoPlayer({ videoUrl, thumbnail, useProxy = false }) {
  const videoRef = useRef(null);
  const [isHlsLoaded, setIsHlsLoaded] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // HLS.js 라이브러리 로드 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.Hls) {
        setIsHlsLoaded(true);
      } else {
        // 스크립트가 아직 로드되지 않았다면 로드 이벤트 리스너 추가
        const handleScriptLoad = () => {
          if (window.Hls) {
            setIsHlsLoaded(true);
          }
        };
        
        document.addEventListener('hlsScriptLoaded', handleScriptLoad);
        
        return () => {
          document.removeEventListener('hlsScriptLoaded', handleScriptLoad);
        };
      }
    }
  }, [scriptLoaded]);

  // 비디오 로드 및 설정
  useEffect(() => {
    if (!videoRef.current || !videoUrl || !isHlsLoaded || !isVideoLoaded) return;

    let hls = null;
    
    const setupHls = () => {
      // URL 형식 수정: 누락된 슬래시 추가 및 절대 경로 확인
      let correctUrl = videoUrl;
      
      // URL이 'https:/'로 시작하면 'https://'로 수정
      if (correctUrl.startsWith('https:/') && !correctUrl.startsWith('https://')) {
        correctUrl = correctUrl.replace('https:/', 'https://');
      }
      
      // URL이 '//'로 시작하지 않고 'http'로 시작하지 않으면 'https://'를 앞에 추가
      if (!correctUrl.startsWith('//') && !correctUrl.startsWith('http')) {
        correctUrl = 'https://' + correctUrl;
      }
      
      // 프록시 사용 여부에 따라 URL 설정
      const finalUrl = useProxy 
        ? `/api/proxy?url=${encodeURIComponent(correctUrl)}`
        : correctUrl;
      
      console.log('비디오 로딩 URL:', finalUrl);
      
      try {
        if (window.Hls && window.Hls.isSupported()) {
          // 이전 HLS 인스턴스가 있으면 정리
          if (hls) {
            hls.destroy();
          }
          
          hls = new window.Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60
          });
          
          hls.loadSource(finalUrl);
          hls.attachMedia(videoRef.current);
          
          // 비디오가 준비되면 자동 재생
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current.play().catch(e => console.error('자동 재생 실패:', e));
          });
          
          // 오류 처리
          hls.on(window.Hls.Events.ERROR, (event, data) => {
            console.error('HLS 오류:', data);
            if (data.fatal) {
              switch(data.type) {
                case window.Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('네트워크 오류, 재시도 중...');
                  hls.startLoad();
                  break;
                case window.Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('미디어 오류, 복구 중...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('치명적인 오류, 복구 불가');
                  hls.destroy();
                  break;
              }
            }
          });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari에서는 HLS를 네이티브로 지원
          videoRef.current.src = finalUrl;
          videoRef.current.play().catch(e => console.error('자동 재생 실패:', e));
        } else {
          console.error('HLS가 지원되지 않는 브라우저입니다');
        }
      } catch (error) {
        console.error('비디오 설정 중 오류 발생:', error);
      }
    };

    setupHls();
    
    // 정리 함수 (cleanup)
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl, isHlsLoaded, useProxy, isVideoLoaded]);

  const handlePlayClick = () => {
    setIsVideoLoaded(true);
    setIsPlaying(true);
  };

  const handleScriptLoad = () => {
    setScriptLoaded(true);
    // 커스텀 이벤트 발생
    const event = new Event('hlsScriptLoaded');
    document.dispatchEvent(event);
  };

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/hls.js@latest" 
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      
      <div className="relative h-full w-full">
        {!isPlaying ? (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
            onClick={handlePlayClick}
            style={{
              backgroundImage: `url(${thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="p-4 rounded-full bg-purple-600 bg-opacity-70 hover:bg-opacity-90 transition-colors duration-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={thumbnail}
            controls
            key={`video-${videoUrl}`}
          />
        )}
      </div>
    </>
  );
} 