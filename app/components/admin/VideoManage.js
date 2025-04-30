'use client';

import { useState, useEffect } from 'react';
import { getQuarterVideos, getWeekVideos, deleteVideo, updateVideo } from '../../firebase/firestore';

export default function VideoManage() {
  const [videos, setVideos] = useState([]);
  const [videoFilter, setVideoFilter] = useState({
    levelId: '1',
    quarterId: 'q1',
    monthId: '',
    weekId: '',
    type: 'lesson'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 필터 변경 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setVideoFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 검색된 비디오 불러오기
  const fetchVideos = async () => {
    try {
      setLoading(true);
      let fetchedVideos = [];
      
      if (videoFilter.type === 'library') {
        fetchedVideos = await getQuarterVideos(
          videoFilter.levelId,
          videoFilter.quarterId
        );
      } else {
        if (!videoFilter.monthId || !videoFilter.weekId) {
          setMessage({
            text: '주차별 비디오를 검색하려면 월과 주차를 모두 선택해주세요.',
            type: 'warning'
          });
          setLoading(false);
          return;
        }
        
        fetchedVideos = await getWeekVideos(
          videoFilter.levelId,
          videoFilter.quarterId,
          videoFilter.monthId,
          videoFilter.weekId
        );
      }
      
      // 검색어가 있으면 필터링
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        fetchedVideos = fetchedVideos.filter(video => 
          video.title.toLowerCase().includes(term) || 
          (video.description && video.description.toLowerCase().includes(term))
        );
      }
      
      setVideos(fetchedVideos);
      setSelectedVideos([]);
      setLoading(false);

      if (fetchedVideos.length === 0) {
        setMessage({
          text: '검색 결과가 없습니다.',
          type: 'info'
        });
      } else {
        setMessage({
          text: `${fetchedVideos.length}개의 비디오를 찾았습니다.`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('비디오 검색 오류:', error);
      setMessage({
        text: '비디오 데이터를 불러오는 중 오류가 발생했습니다.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  // 개별 비디오 삭제 핸들러
  const handleDelete = async (videoId) => {
    if (!confirm('정말로 이 비디오를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteVideo(videoId);
      
      // 목록에서 삭제된 비디오 제거
      setVideos(prev => prev.filter(v => v.id !== videoId));
      // 선택된 비디오 목록에서도 제거
      setSelectedVideos(prev => prev.filter(id => id !== videoId));
      
      setMessage({
        text: '비디오가 성공적으로 삭제되었습니다.',
        type: 'success'
      });
      setLoading(false);
    } catch (error) {
      console.error('비디오 삭제 오류:', error);
      setMessage({
        text: '비디오 삭제 중 오류가 발생했습니다.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  // 다중 비디오 삭제 핸들러
  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) {
      setMessage({
        text: '삭제할 비디오를 선택해주세요.',
        type: 'warning'
      });
      return;
    }
    
    if (!confirm(`선택한 ${selectedVideos.length}개의 비디오를 모두 삭제하시겠습니까?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // 선택된 모든 비디오 삭제
      for (const videoId of selectedVideos) {
        await deleteVideo(videoId);
      }
      
      // 목록에서 삭제된 비디오들 제거
      setVideos(prev => prev.filter(v => !selectedVideos.includes(v.id)));
      setSelectedVideos([]);
      
      setMessage({
        text: `${selectedVideos.length}개의 비디오가 성공적으로 삭제되었습니다.`,
        type: 'success'
      });
      setLoading(false);
    } catch (error) {
      console.error('다중 비디오 삭제 오류:', error);
      setMessage({
        text: '비디오 삭제 중 오류가 발생했습니다.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  // 비디오 선택 토글 핸들러
  const toggleVideoSelection = (videoId) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };

  // 전체 선택/해제 토글 핸들러
  const toggleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      // 모두 선택된 상태면 모두 해제
      setSelectedVideos([]);
    } else {
      // 아니면 모두 선택
      setSelectedVideos(videos.map(v => v.id));
    }
  };

  // 비디오 편집 시작 핸들러
  const handleEditStart = (video) => {
    setEditingVideo({ ...video });
  };

  // 편집 중인 비디오 필드 변경 핸들러
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingVideo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 비디오 편집 저장 핸들러
  const handleEditSave = async () => {
    try {
      setLoading(true);
      
      // Firebase에 비디오 정보 업데이트
      await updateVideo(editingVideo.id, {
        title: editingVideo.title,
        description: editingVideo.description,
        thumbnail: editingVideo.thumbnail,
        videoUrl: editingVideo.videoUrl
      });
      
      // 로컬 목록 업데이트
      setVideos(prev => 
        prev.map(v => v.id === editingVideo.id ? editingVideo : v)
      );
      
      setMessage({
        text: '비디오 정보가 성공적으로 업데이트되었습니다.',
        type: 'success'
      });
      
      // 편집 모드 종료
      setEditingVideo(null);
      setLoading(false);
    } catch (error) {
      console.error('비디오 업데이트 오류:', error);
      setMessage({
        text: '비디오 정보 업데이트 중 오류가 발생했습니다.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  // 편집 취소 핸들러
  const handleEditCancel = () => {
    setEditingVideo(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">비디오 관리</h2>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' :
          message.type === 'error' ? 'bg-red-100 text-red-700' :
          message.type === 'info' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* 검색 필터 */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-gray-700 font-medium mb-3">비디오 검색</h3>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            제목/설명 검색
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="검색어 입력..."
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              비디오 유형
            </label>
            <select
              name="type"
              value={videoFilter.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="lesson">주차별 수업</option>
              <option value="library">영상 자료실</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              레벨
            </label>
            <select
              name="levelId"
              value={videoFilter.levelId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="1">레벨 1</option>
              <option value="2">레벨 2</option>
              <option value="3">레벨 3</option>
              <option value="4">레벨 4</option>
              <option value="5">레벨 5</option>
              <option value="6">레벨 6</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              분기
            </label>
            <select
              name="quarterId"
              value={videoFilter.quarterId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="q1">1분기</option>
              <option value="q2">2분기</option>
              <option value="q3">3분기</option>
              <option value="q4">4분기</option>
            </select>
          </div>
          
          {videoFilter.type === 'lesson' && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  월
                </label>
                <select
                  name="monthId"
                  value={videoFilter.monthId}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">선택하세요</option>
                  {videoFilter.quarterId === 'q1' && (
                    <>
                      <option value="m1">1분기 첫번째 달</option>
                      <option value="m2">1분기 두번째 달</option>
                      <option value="m3">1분기 세번째 달</option>
                    </>
                  )}
                  {videoFilter.quarterId === 'q2' && (
                    <>
                      <option value="m4">2분기 첫번째 달</option>
                      <option value="m5">2분기 두번째 달</option>
                      <option value="m6">2분기 세번째 달</option>
                    </>
                  )}
                  {videoFilter.quarterId === 'q3' && (
                    <>
                      <option value="m7">3분기 첫번째 달</option>
                      <option value="m8">3분기 두번째 달</option>
                      <option value="m9">3분기 세번째 달</option>
                    </>
                  )}
                  {videoFilter.quarterId === 'q4' && (
                    <>
                      <option value="m10">4분기 첫번째 달</option>
                      <option value="m11">4분기 두번째 달</option>
                      <option value="m12">4분기 세번째 달</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  주차
                </label>
                <select
                  name="weekId"
                  value={videoFilter.weekId}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">선택하세요</option>
                  <option value="w1">1주차</option>
                  <option value="w2">2주차</option>
                  <option value="w3">3주차</option>
                  <option value="w4">4주차</option>
                </select>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-4">
          <button
            onClick={fetchVideos}
            disabled={loading}
            className={`py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '검색 중...' : '비디오 검색'}
          </button>
        </div>
      </div>
      
      {/* 비디오 목록 */}
      {videos.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedVideos.length === videos.length && videos.length > 0}
              onChange={toggleSelectAll}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              {selectedVideos.length > 0 
                ? `${selectedVideos.length}개 선택됨` 
                : '전체 선택'}
            </span>
          </div>
          
          {selectedVideos.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              선택 항목 삭제
            </button>
          )}
        </div>
      )}
      
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {videos.map((video) => (
            <div key={video.id} className={`border rounded-lg p-4 ${
              selectedVideos.includes(video.id) ? 'bg-purple-50 border-purple-200' : ''
            }`}>
              {editingVideo && editingVideo.id === video.id ? (
                // 편집 모드
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        제목 *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editingVideo.title}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        비디오 URL *
                      </label>
                      <input
                        type="url"
                        name="videoUrl"
                        value={editingVideo.videoUrl}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        설명
                      </label>
                      <textarea
                        name="description"
                        value={editingVideo.description || ''}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                        rows="2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        썸네일 URL
                      </label>
                      <input
                        type="url"
                        name="thumbnail"
                        value={editingVideo.thumbnail || ''}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleEditCancel}
                      className="py-1 px-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleEditSave}
                      disabled={loading}
                      className="py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div className="flex flex-col md:flex-row">
                  <div className="flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => toggleVideoSelection(video.id)}
                      className="mr-3"
                    />
                    
                    <div className="md:w-36 flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-20 bg-gray-200 flex items-center justify-center rounded">
                          <span className="text-3xl">🎬</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                    <div className="text-sm text-gray-500">
                      유형: {video.type === 'lesson' ? '주차별 수업' : '영상 자료실'}
                      {video.type === 'lesson' && (
                        <> | 레벨: {video.levelId} | 분기: {video.quarterId} | 월: {video.monthId} | 주차: {video.weekId}</>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0 space-x-2">
                    <button
                      onClick={() => handleEditStart(video)}
                      className="py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {loading ? (
            <p>영상을 검색 중입니다...</p>
          ) : (
            <p>
              {message.text ? message.text : '검색 결과가 없습니다. 다른 필터를 선택해보세요.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 