'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { handleVideoDownload } from '../utils/videoUtils';

export default function VideoCard({ 
  video, 
  canDownload = false, 
  layout = 'vertical',
  showDescription = true,
  useProxy = false
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 다운로드 이벤트 리스너 등록
    const handleDownloadStarted = () => {
      setIsDownloading(true);
      setErrorMessage('');
    };
    
    const handleDownloadCompleted = () => {
      setIsDownloading(false);
      setErrorMessage('');
    };
    
    const handleDownloadError = (event) => {
      setIsDownloading(false);
      setErrorMessage(event.detail.error || '다운로드 중 오류가 발생했습니다');
      setTimeout(() => setErrorMessage(''), 5000); // 5초 후 오류 메시지 삭제
    };

    window.addEventListener('download-started', handleDownloadStarted);
    window.addEventListener('download-completed', handleDownloadCompleted);
    window.addEventListener('download-error', handleDownloadError);

    return () => {
      window.removeEventListener('download-started', handleDownloadStarted);
      window.removeEventListener('download-completed', handleDownloadCompleted);
      window.removeEventListener('download-error', handleDownloadError);
    };
  }, []);

  const startDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setErrorMessage('');
    
    try {
      await handleVideoDownload(video.videoUrl, video.title);
    } catch (error) {
      console.error('다운로드 오류:', error);
      setErrorMessage(error.message || '다운로드 중 오류가 발생했습니다');
      setIsDownloading(false);
      
      // 5초 후 오류 메시지 삭제
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-4 border-4 border-white shadow-lg ${layout === 'vertical' ? 'transform hover:scale-105 transition-transform duration-300' : ''}`}>
      <div className={`${layout === 'vertical' ? 'aspect-video mb-4' : 'aspect-video my-4'} rounded-xl overflow-hidden border-4 border-purple-100`}>
        <VideoPlayer 
          videoUrl={video.videoUrl} 
          thumbnail={video.thumbnail} 
          useProxy={useProxy}
        />
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h2 className={`${layout === 'vertical' ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 mb-2 font-comic`}>
            {video.title}
          </h2>
          {showDescription && (
            <p className="text-gray-600 mb-2 font-comic">
              {video.description}
            </p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-sm mt-1 mb-2 font-comic">
              {errorMessage}
            </p>
          )}
        </div>
        
        {canDownload && (
          <button
            onClick={startDownload}
            disabled={isDownloading}
            className={`flex items-center ${
              isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } text-white px-3 py-1 rounded-lg transition duration-200`}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리중...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                다운로드
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
} 