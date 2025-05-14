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
  const { user, isAdmin, isTeacher } = useAuth();
  const hasAccess = isAdmin || isTeacher;
  const canDownload = hasAccess;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Firebase에서 해당 주차의 비디오 데이터 가져오기
        const videos = await getWeekVideos(levelId, quarter, month, week);
        // 권한이 있는 사용자는 모든 비디오를 볼 수 있고,
        // 권한이 없는 사용자는 library 타입의 비디오만 볼 수 있음
        const filteredVideos = hasAccess ? videos : videos.filter(video => video.type === 'library');
        setLessons(filteredVideos);
        setLoading(false);
      } catch (err) {
        console.error('비디오 데이터 불러오기 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    fetchData();
  }, [levelId, quarter, month, week, hasAccess]);

  // 권한이 없는 경우 접근 제한 메시지 표시
  if (!hasAccess) {
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

          <div className="bg-white rounded-2xl p-6 border-4 border-white shadow-lg text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2 font-comic">접근 권한이 없습니다</h2>
            <p className="text-gray-500 font-comic">
              이 페이지는 선생님과 관리자만 접근할 수 있습니다.
            </p>
            {!user && (
              <Link
                href="/login"
                className="mt-4 inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                로그인하기
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

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
          <div className="bg-white rounded-2xl p-6 border-4 border-white shadow-lg text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2 font-comic">아직 영상 자료가 없어요</h2>
            <p className="text-gray-500 font-comic">
              준비 중이니 조금만 기다려주세요!
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 