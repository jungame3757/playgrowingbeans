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
  const { user, isAdmin, isTeacher } = useAuth();
  const canDownload = isAdmin || isTeacher;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Firebase에서 해당 분기의 영상 자료실 데이터 가져오기
        const videoData = await getQuarterVideos(levelId, quarter);
        
        // 사용자 권한에 따라 비디오 필터링
        let filteredVideos = videoData;
        if (!user) {
          // 비로그인 상태: 영상 자료실에 속한 영상만 표시
          filteredVideos = videoData.filter(video => video.type === 'library');
        } else if (isAdmin || isTeacher) {
          // 관리자/선생님: 모든 영상 표시
          filteredVideos = videoData;
        } else {
          // 일반 로그인 사용자: 영상 자료실 영상만 표시
          filteredVideos = videoData.filter(video => video.type === 'library');
        }
        
        setVideos(filteredVideos);
        setLoading(false);
      } catch (err) {
        console.error('영상 자료실 데이터 불러오기 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    fetchData();
  }, [levelId, quarter, user, isAdmin, isTeacher]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!videos.length) return <EmptyState />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">
          {quarterNames[quarter] || `${quarter}분기`} 영상
        </h1>
        {!user && (
          <p className="text-gray-600">
            로그인하시면 더 많은 영상을 시청하실 수 있습니다.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            canDownload={canDownload}
          />
        ))}
      </div>
    </div>
  );
} 