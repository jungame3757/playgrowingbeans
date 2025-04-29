'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getWeekVideos } from '../../../../../firebase/firestore';
import Script from 'next/script';

const monthNames = {
  m1: '1분기 첫번째 달',
  m2: '1분기 두번째 달',
  m3: '1분기 세번째 달',
  m4: '2분기 첫번째 달',
  m5: '2분기 두번째 달',
  m6: '2분기 세번째 달',
  m7: '3분기 첫번째 달',
  m8: '3분기 두번째 달',
  m9: '3분기 세번째 달',
  m10: '4분기 첫번째 달',
  m11: '4분기 두번째 달',
  m12: '4분기 세번째 달'
};

const quarterNames = {
  q1: '1분기',
  q2: '2분기',
  q3: '3분기',
  q4: '4분기'
};

const weekNames = {
  w1: '1주차',
  w2: '2주차',
  w3: '3주차',
  w4: '4주차'
};

// 비디오 플레이어 컴포넌트
function VideoPlayer({ videoUrl, thumbnail }) {
  const videoRef = useRef(null);
  const [isHlsLoaded, setIsHlsLoaded] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !videoUrl || !isHlsLoaded) return;

    const setupHls = () => {
      if (window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari에서는 HLS를 네이티브로 지원
        videoRef.current.src = videoUrl;
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

export default function WeekDetail() {
  const params = useParams();
  const { id: levelId, quarter, month, week } = params;
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Firebase에서 해당 주차의 비디오 데이터 가져오기
        const videos = await getWeekVideos(levelId, quarter, month, week);
        setLessons(videos);
        setLoading(false);
      } catch (err) {
        console.error('비디오 데이터 불러오기 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    fetchData();
  }, [levelId, quarter, month, week]);

  // 데이터가 없을 경우 보여줄 임시 데이터 (Firebase에 실제 데이터가 없을 때)
  const tempLessons = [
    {
      id: 1,
      title: '인사하는 방법',
      description: '인사하는 방법을 배워봐요!',
      videoUrl: 'https://d3asw5knevel36.cloudfront.net/videos/레벨1/1분기/hls/레벨1 복습영상 3월 1주/레벨1 복습영상 3월 1주.m3u8',
      thumbnail: '/thumbnails/hello.jpg',
      script: '안녕하세요! 만나서 반가워요!',
      icon: '👋'
    },
    {
      id: 2,
      title: 'ABC 노래',
      description: '알파벳을 배워봐요!',
      videoUrl: 'https://d3asw5knevel36.cloudfront.net/videos/레벨1/1분기/hls/레벨1 복습영상 3월 1주/레벨1 복습영상 3월 1주.m3u8',
      thumbnail: '/thumbnails/abc.jpg',
      script: 'A, B, C, D, E, F, G...',
      icon: '🔤'
    }
  ];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href={`/levels/${levelId}/${quarter}/${month}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-comic"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {monthNames[month]}으로 돌아가기
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-8 border-4 border-white shadow-lg">
          <h1 className="text-4xl font-bold text-purple-600 mb-4 font-comic">
            {monthNames[month]} {weekNames[week]}
          </h1>
          <p className="text-xl text-gray-600 font-comic">
            즐겁게 영어를 배워보아요!
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
        ) : lessons.length > 0 ? (
          <div className="space-y-8">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-2xl p-6 border-4 border-white shadow-lg">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{lesson.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 font-comic">{lesson.title}</h2>
                    <p className="text-gray-600 font-comic">{lesson.description}</p>
                  </div>
                </div>
                
                <div className="aspect-video mb-4 rounded-xl overflow-hidden border-4 border-purple-100">
                  {/* HLS 스트리밍을 위한 비디오 플레이어 */}
                  <VideoPlayer 
                    videoUrl={lesson.videoUrl} 
                    thumbnail={lesson.thumbnail} 
                  />
                </div>

                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                  <h3 className="font-bold text-purple-600 mb-2 font-comic">따라해 보세요!</h3>
                  <p className="text-gray-700 text-lg font-comic">{lesson.script}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Firebase에 데이터가 없을 경우 템플릿 데이터 표시
          <div className="space-y-8">
            {tempLessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-2xl p-6 border-4 border-white shadow-lg">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{lesson.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 font-comic">{lesson.title}</h2>
                    <p className="text-gray-600 font-comic">{lesson.description}</p>
                  </div>
                </div>
                
                <div className="aspect-video mb-4 rounded-xl overflow-hidden border-4 border-purple-100">
                  {/* HLS 스트리밍을 위한 비디오 플레이어 */}
                  <VideoPlayer 
                    videoUrl={lesson.videoUrl} 
                    thumbnail={lesson.thumbnail} 
                  />
                </div>

                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                  <h3 className="font-bold text-purple-600 mb-2 font-comic">따라해 보세요!</h3>
                  <p className="text-gray-700 text-lg font-comic">{lesson.script}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 