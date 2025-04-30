'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  getFirestore, 
  where,
  orderBy,
  limit,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVideos: 0,
    videosPerLevel: {},
    videosPerQuarter: {},
    lessonVideos: 0,
    libraryVideos: 0,
    recentVideos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 통계 데이터 불러오기
  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);
        setError(null);
        
        const videosCollection = collection(db, 'videos');
        
        // 전체 비디오 수 계산
        const totalSnap = await getCountFromServer(videosCollection);
        const totalVideos = totalSnap.data().count;
        
        // 비디오 타입별 개수 (수업, 자료실)
        const lessonQuery = query(videosCollection, where('type', '==', 'lesson'));
        const lessonSnap = await getCountFromServer(lessonQuery);
        const lessonVideos = lessonSnap.data().count;
        
        const libraryQuery = query(videosCollection, where('type', '==', 'library'));
        const librarySnap = await getCountFromServer(libraryQuery);
        const libraryVideos = librarySnap.data().count;
        
        // 레벨별 비디오 개수
        const videosPerLevel = {};
        for (let i = 1; i <= 6; i++) {
          const levelQuery = query(videosCollection, where('levelId', '==', i.toString()));
          const levelSnap = await getCountFromServer(levelQuery);
          videosPerLevel[i] = levelSnap.data().count;
        }
        
        // 분기별 비디오 개수
        const videosPerQuarter = {};
        for (let i = 1; i <= 4; i++) {
          const quarterQuery = query(videosCollection, where('quarterId', '==', `q${i}`));
          const quarterSnap = await getCountFromServer(quarterQuery);
          videosPerQuarter[i] = quarterSnap.data().count;
        }
        
        // 최근 추가된 5개 비디오
        const recentVideosQuery = query(
          videosCollection,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentVideosSnap = await getDocs(recentVideosQuery);
        const recentVideos = [];
        
        recentVideosSnap.forEach(doc => {
          recentVideos.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          });
        });
        
        // 통계 업데이트
        setStats({
          totalVideos,
          videosPerLevel,
          videosPerQuarter,
          lessonVideos,
          libraryVideos,
          recentVideos
        });
        
        setLoading(false);
      } catch (error) {
        console.error('대시보드 통계 로딩 오류:', error);
        setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }
    
    fetchDashboardStats();
  }, []);

  // 날짜 포맷 함수
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-40">
          <div className="spinner"></div>
          <p className="ml-2">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">관리자 대시보드</h2>
      
      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-100 rounded-lg p-4">
          <h3 className="text-purple-800 text-lg font-semibold">전체 비디오</h3>
          <p className="text-purple-900 text-3xl font-bold">{stats.totalVideos}</p>
        </div>
        
        <div className="bg-blue-100 rounded-lg p-4">
          <h3 className="text-blue-800 text-lg font-semibold">주차별 수업</h3>
          <p className="text-blue-900 text-3xl font-bold">{stats.lessonVideos}</p>
        </div>
        
        <div className="bg-green-100 rounded-lg p-4">
          <h3 className="text-green-800 text-lg font-semibold">영상 자료실</h3>
          <p className="text-green-900 text-3xl font-bold">{stats.libraryVideos}</p>
        </div>
        
        <div className="bg-yellow-100 rounded-lg p-4">
          <h3 className="text-yellow-800 text-lg font-semibold">최근 추가</h3>
          <p className="text-yellow-900 text-3xl font-bold">{stats.recentVideos.length}</p>
        </div>
      </div>
      
      {/* 레벨별, 분기별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">레벨별 비디오</h3>
          <div className="space-y-2">
            {Object.entries(stats.videosPerLevel).map(([level, count]) => (
              <div key={level} className="flex items-center">
                <div className="w-1/4">레벨 {level}</div>
                <div className="w-3/4 flex items-center">
                  <div 
                    className="bg-purple-500 h-4 rounded"
                    style={{ 
                      width: `${Math.max(count / stats.totalVideos * 100, 3)}%`
                    }}
                  ></div>
                  <span className="ml-2">{count}개</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">분기별 비디오</h3>
          <div className="space-y-2">
            {Object.entries(stats.videosPerQuarter).map(([quarter, count]) => (
              <div key={quarter} className="flex items-center">
                <div className="w-1/4">{quarter}분기</div>
                <div className="w-3/4 flex items-center">
                  <div 
                    className="bg-blue-500 h-4 rounded"
                    style={{ 
                      width: `${Math.max(count / stats.totalVideos * 100, 3)}%` 
                    }}
                  ></div>
                  <span className="ml-2">{count}개</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 최근 추가된 비디오 */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">최근 추가된 비디오</h3>
        {stats.recentVideos.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>타입</th>
                <th>레벨</th>
                <th>추가일</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentVideos.map(video => (
                <tr key={video.id}>
                  <td>{video.title}</td>
                  <td>{video.type === 'lesson' ? '주차별 수업' : '영상 자료실'}</td>
                  <td>레벨 {video.levelId}</td>
                  <td>{formatDate(video.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-4">최근 추가된 비디오가 없습니다.</p>
        )}
      </div>
    </div>
  );
} 