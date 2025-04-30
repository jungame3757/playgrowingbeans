'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getQuarterVideos } from '../../../../firebase/firestore';
import Script from 'next/script';

const quarterNames = {
  q1: '1분기',
  q2: '2분기',
  q3: '3분기',
  q4: '4분기'
};

// 비디오 플레이어 컴포넌트
function VideoPlayer({ videoUrl, thumbnail }) {
  const videoRef = useRef(null);
  const [isHlsLoaded, setIsHlsLoaded] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !videoUrl || !isHlsLoaded) return;

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
      
      // 프록시 API를 통해 비디오 URL 로드
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(correctUrl)}`;
      console.log('비디오 로딩 URL:', proxyUrl);
      
      if (window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(proxyUrl);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari에서는 HLS를 네이티브로 지원
        videoRef.current.src = proxyUrl;
      } else {
        console.error('HLS가 지원되지 않는 브라우저입니다');
      }
    };

    setupHls();
  }, [videoUrl, isHlsLoaded]);

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/hls.js@latest" 
        onLoad={() => setIsHlsLoaded(true)}
        strategy="lazyOnload"
      />
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={thumbnail}
        controls
      />
    </>
  );
}

export default function VideoLibrary() {
  const params = useParams();
  const { id: levelId, quarter } = params;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Firebase에서 해당 분기의 영상 자료실 데이터 가져오기
        const videoData = await getQuarterVideos(levelId, quarter);
        setVideos(videoData);
        setLoading(false);
      } catch (err) {
        console.error('영상 자료실 데이터 불러오기 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    fetchData();
  }, [levelId, quarter]);

  // 임시 데이터 - Firebase에 데이터가 없을 경우
  const tempVideos = [
    {
      id: 1,
      title: 'Hello Song',
      description: '인사하는 방법을 배워봐요!',
      videoUrl: 'https://d3asw5knevel36.cloudfront.net/videos/레벨1/1분기/hls/레벨1 복습영상 3월 1주/레벨1 복습영상 3월 1주.m3u8',
      thumbnail: '/thumbnails/hello.jpg'
    },
    {
      id: 2,
      title: 'ABC Song',
      description: '알파벳을 배워봐요!',
      videoUrl: 'https://d3asw5knevel36.cloudfront.net/videos/레벨1/1분기/hls/레벨1 복습영상 3월 1주/레벨1 복습영상 3월 1주.m3u8',
      thumbnail: '/thumbnails/abc.jpg'
    },
    {
      id: 3,
      title: 'Numbers Song',
      description: '숫자를 배워봐요!',
      videoUrl: 'https://d3asw5knevel36.cloudfront.net/videos/레벨1/1분기/hls/레벨1 복습영상 3월 1주/레벨1 복습영상 3월 1주.m3u8',
      thumbnail: '/thumbnails/numbers.jpg'
    },
    {
      id: 4,
      title: 'Colors Song',
      description: '색상을 배워봐요!',
      videoUrl: 'https://d3asw5knevel36.cloudfront.net/videos/레벨1/1분기/hls/레벨1 복습영상 3월 1주/레벨1 복습영상 3월 1주.m3u8',
      thumbnail: '/thumbnails/colors.jpg'
    }
  ];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            href={`/levels/${levelId}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-comic"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            레벨 {levelId}로 돌아가기
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-8 border-4 border-white shadow-lg">
          <h1 className="text-4xl font-bold text-purple-600 mb-4 font-comic">
            {quarterNames[quarter]} 영상 자료실
          </h1>
          <p className="text-xl text-gray-600 font-comic">
            영상을 보면서 즐겁게 배워보아요!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-bounce text-5xl mb-4">🔄</div>
            <p className="text-gray-600 font-comic">영상을 불러오고 있어요...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-2xl p-6 border-4 border-white shadow-lg">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-gray-600 font-comic">
              {error}
            </p>
            <p className="text-gray-600 font-comic mt-2">
              나중에 다시 시도해주세요.
            </p>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-2xl p-4 border-4 border-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="aspect-video mb-4 rounded-xl overflow-hidden border-4 border-purple-100 relative">
                  {/* HLS 스트리밍을 위한 비디오 플레이어 */}
                  <VideoPlayer 
                    videoUrl={video.videoUrl} 
                    thumbnail={video.thumbnail} 
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2 font-comic">{video.title}</h2>
                <p className="text-gray-600 mb-2 font-comic">{video.description}</p>
              </div>
            ))}
          </div>
        ) : (
          // Firebase에 데이터가 없을 경우 안내 메시지 표시
          <div className="text-center py-12 bg-white rounded-2xl p-8 border-4 border-white shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-4 font-comic">
              아직 영상 자료가 없어요
            </h2>
            <p className="text-gray-500 font-comic mb-2">
              {quarterNames[quarter]} 영상 자료를 준비 중이에요.
            </p>
            <p className="text-gray-500 font-comic">
              조금만 기다려주세요!
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 