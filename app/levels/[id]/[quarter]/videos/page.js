'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getQuarterVideos } from '../../../../firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';
import VideoCard from '../../../../components/VideoCard';
import { LoadingState, ErrorState, EmptyState } from '../../../../components/VideoStateDisplay';
import { quarterNames } from '../../../../utils/videoUtils';

export default function VideoLibrary() {
  const params = useParams();
  const { id: levelId, quarter } = params;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin, isTeacher } = useAuth();
  const canDownload = isAdmin || isTeacher;

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
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard 
                key={video.id} 
                video={video} 
                canDownload={canDownload} 
                layout="vertical"
                useProxy={true}
              />
            ))}
          </div>
        ) : (
          // Firebase에 데이터가 없을 경우 안내 메시지 표시
          <EmptyState type="영상" quarter={quarterNames[quarter]} />
        )}
      </div>
    </main>
  );
} 