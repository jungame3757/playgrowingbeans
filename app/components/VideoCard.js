'use client';

import VideoPlayer from './VideoPlayer';
import { handleVideoDownload } from '../utils/videoUtils';

export default function VideoCard({ 
  video, 
  canDownload = false, 
  layout = 'vertical',
  showDescription = true,
  useProxy = false
}) {
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
        </div>
        
        {canDownload && (
          <button
            onClick={() => handleVideoDownload(video.videoUrl, video.title)}
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            다운로드
          </button>
        )}
      </div>
    </div>
  );
} 