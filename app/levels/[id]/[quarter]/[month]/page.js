'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getWeekVideos } from '../../../../firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';

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

const weeks = [
  { id: 'w1', title: '1주차', icon: '📅' },
  { id: 'w2', title: '2주차', icon: '📅' },
  { id: 'w3', title: '3주차', icon: '📅' },
  { id: 'w4', title: '4주차', icon: '📅' }
];

export default function MonthDetail() {
  const params = useParams();
  const { id: levelId, quarter, month } = params;
  const [weekVideos, setWeekVideos] = useState({
    w1: false,
    w2: false,
    w3: false,
    w4: false
  });
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, isTeacher } = useAuth();
  const hasAccess = isAdmin || isTeacher;

  useEffect(() => {
    async function fetchVideosData() {
      try {
        setLoading(true);
        const results = {};
        
        // 각 주차별로 영상 데이터가 있는지 확인
        for (const week of weeks) {
          const videos = await getWeekVideos(levelId, quarter, month, week.id);
          // 권한이 있는 사용자는 모든 비디오를 볼 수 있고,
          // 권한이 없는 사용자는 library 타입의 비디오만 볼 수 있음
          const filteredVideos = hasAccess ? videos : videos.filter(video => video.type === 'library');
          results[week.id] = filteredVideos.length > 0;
        }
        
        setWeekVideos(results);
        setLoading(false);
      } catch (err) {
        console.error('주차별 영상 데이터 확인 오류:', err);
        setLoading(false);
      }
    }

    fetchVideosData();
  }, [levelId, quarter, month, hasAccess]);

  // 권한이 없는 경우 접근 제한 메시지 표시
  if (!hasAccess) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
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
            {monthNames[month]}
          </h1>
          <p className="text-xl text-gray-600 font-comic">
            함께 영어를 배워봐요!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-bounce text-5xl mb-4">🔄</div>
            <p className="text-gray-600 font-comic">데이터를 불러오고 있어요...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weeks.map((week) => (
              weekVideos[week.id] && (
                <Link
                  key={week.id}
                  href={`/levels/${levelId}/${quarter}/${month}/${week.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-2xl p-6 border-4 border-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center">
                      <span className="text-4xl mr-4">{week.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 font-comic">{week.title}</h2>
                        <p className="text-gray-600 font-comic">이번 주차 수업을 확인해보세요!</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            ))}
            
            {/* 주차별 영상이 하나도 없는 경우 메시지 표시 */}
            {!Object.values(weekVideos).some(hasVideo => hasVideo) && (
              <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 border-4 border-white shadow-lg text-center">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-gray-600 mb-2 font-comic">아직 영상 자료가 없어요</h2>
                <p className="text-gray-500 font-comic">
                  준비 중이니 조금만 기다려주세요!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 