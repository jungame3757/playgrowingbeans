'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getWeekVideos } from '../../../../../firebase/firestore';
import Script from 'next/script';
import { useAuth } from '../../../../../contexts/AuthContext';

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

export default function WeekDetail() {
  const params = useParams();
  const { id: levelId, quarter, month, week } = params;
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin, isTeacher } = useAuth();
  const canDownload = isAdmin || isTeacher;

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
      thumbnail: '/thumbnails/hello.jpg'
    },
    {
      id: 2,
      title: 'ABC 노래',
      description: '알파벳을 배워봐요!',
      videoUrl: 'https://d3asw5knevel36.cloudfront.net/videos/레벨1/1분기/hls/레벨1 복습영상 3월 1주/레벨1 복습영상 3월 1주.m3u8',
      thumbnail: '/thumbnails/abc.jpg'
    }
  ];

  // 다운로드 핸들러
  const handleDownload = (videoUrl, title) => {
    // HLS 스트리밍 URL을 MP4 URL로 변환
    const mp4Url = videoUrl.replace('.m3u8', '.mp4').replace('/hls/', '/');
    
    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = mp4Url;
    link.download = `${title}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 font-comic">{lesson.title}</h2>
                    <p className="text-gray-600 font-comic">{lesson.description}</p>
                  </div>
                  
                  {canDownload && (
                    <button
                      onClick={() => handleDownload(lesson.videoUrl, lesson.title)}
                      className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      다운로드
                    </button>
                  )}
                </div>
                
                <div className="aspect-video my-4 rounded-xl overflow-hidden border-4 border-purple-100">
                  {/* HLS 스트리밍을 위한 비디오 플레이어 */}
                  <VideoPlayer 
                    videoUrl={lesson.videoUrl} 
                    thumbnail={lesson.thumbnail} 
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Firebase에 데이터가 없을 경우 템플릿 데이터 표시
          <div className="space-y-8">
            {tempLessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-2xl p-6 border-4 border-white shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 font-comic">{lesson.title}</h2>
                    <p className="text-gray-600 font-comic">{lesson.description}</p>
                  </div>
                  
                  {canDownload && (
                    <button
                      onClick={() => handleDownload(lesson.videoUrl, lesson.title)}
                      className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      다운로드
                    </button>
                  )}
                </div>
                
                <div className="aspect-video my-4 rounded-xl overflow-hidden border-4 border-purple-100">
                  {/* HLS 스트리밍을 위한 비디오 플레이어 */}
                  <VideoPlayer 
                    videoUrl={lesson.videoUrl} 
                    thumbnail={lesson.thumbnail} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 