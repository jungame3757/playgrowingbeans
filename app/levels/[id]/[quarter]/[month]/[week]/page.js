'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getWeekVideos } from '../../../../../firebase/firestore';
import { useAuth } from '../../../../../contexts/AuthContext';
import VideoCard from '../../../../../components/VideoCard';
import { LoadingState, ErrorState } from '../../../../../components/VideoStateDisplay';
import { monthNames, weekNames, quarterNames } from '../../../../../utils/videoUtils';

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
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : lessons.length > 0 ? (
          <div className="space-y-8">
            {lessons.map((lesson) => (
              <VideoCard 
                key={lesson.id} 
                video={lesson} 
                canDownload={canDownload} 
                layout="horizontal"
              />
            ))}
          </div>
        ) : (
          // Firebase에 데이터가 없을 경우 템플릿 데이터 표시
          <div className="space-y-8">
            {tempLessons.map((lesson) => (
              <VideoCard 
                key={lesson.id} 
                video={lesson} 
                canDownload={canDownload} 
                layout="horizontal"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 