'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { addVideo, getQuarterVideos, getWeekVideos, updateVideo, deleteVideo } from '../firebase/firestore';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    script: '',
    icon: '',
    levelId: '1',
    quarterId: 'q1',
    monthId: '',
    weekId: '',
    type: 'lesson',
    duration: '0:00',
    views: 0
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videoFilter, setVideoFilter] = useState({
    levelId: '1',
    quarterId: 'q1',
    monthId: '',
    weekId: '',
    type: 'lesson'
  });

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
      
      setVideos(fetchedVideos);
      setLoading(false);
    } catch (error) {
      console.error('비디오 검색 오류:', error);
      setMessage({
        text: '비디오 데이터를 불러오는 중 오류가 발생했습니다.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 필터 변경 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setVideoFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 비디오 타입 변경 시 필요 필드 조정
  useEffect(() => {
    if (formData.type === 'library') {
      setFormData(prev => ({
        ...prev,
        monthId: '',
        weekId: ''
      }));
    }
  }, [formData.type]);

  // 비디오 추가 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // 필수 필드 검증
      if (!formData.title || !formData.videoUrl) {
        setMessage({
          text: '제목과 비디오 URL은 필수 입력항목입니다.',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // 타입에 따른 필드 검증
      if (formData.type === 'lesson' && (!formData.monthId || !formData.weekId)) {
        setMessage({
          text: '주차별 영상에는 월과 주차 정보가 필요합니다.',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Firebase에 비디오 추가
      await addVideo(formData);
      
      setMessage({
        text: '비디오가 성공적으로 추가되었습니다!',
        type: 'success'
      });
      
      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        thumbnail: '',
        script: '',
        icon: '',
        levelId: '1',
        quarterId: 'q1',
        monthId: '',
        weekId: '',
        type: 'lesson',
        duration: '0:00',
        views: 0
      });
      
      setLoading(false);
    } catch (error) {
      console.error('비디오 추가 오류:', error);
      setMessage({
        text: '비디오 추가 중 오류가 발생했습니다.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  // 비디오 삭제 핸들러
  const handleDelete = async (videoId) => {
    if (!confirm('정말로 이 비디오를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteVideo(videoId);
      
      // 목록 갱신
      await fetchVideos();
      
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

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">그로잉 빈즈 관리자</h1>
            <Link 
              href="/"
              className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              사이트로 돌아가기
            </Link>
          </div>
          
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('add')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'add'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                비디오 추가
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                비디오 관리
              </button>
            </nav>
          </div>
        </header>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' :
            message.type === 'error' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">새 비디오 추가</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 왼쪽 컬럼 - 기본 정보 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목 *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
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
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      비디오 URL (CloudFront HLS .m3u8) *
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="https://example-cloudfront.net/videos/lesson1/master.m3u8"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">HLS 스트리밍을 위한 .m3u8 파일 경로를 입력하세요.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      썸네일 URL
                    </label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                {/* 오른쪽 컬럼 - 메타데이터 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        비디오 유형
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="lesson">주차별 수업</option>
                        <option value="library">영상 자료실</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        아이콘 (이모지)
                      </label>
                      <input
                        type="text"
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="예: 👋"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        레벨
                      </label>
                      <select
                        name="levelId"
                        value={formData.levelId}
                        onChange={handleChange}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        분기
                      </label>
                      <select
                        name="quarterId"
                        value={formData.quarterId}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="q1">1분기</option>
                        <option value="q2">2분기</option>
                        <option value="q3">3분기</option>
                        <option value="q4">4분기</option>
                      </select>
                    </div>
                  </div>
                  
                  {formData.type === 'lesson' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          월
                        </label>
                        <select
                          name="monthId"
                          value={formData.monthId}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">선택하세요</option>
                          {formData.quarterId === 'q1' && (
                            <>
                              <option value="m1">1분기 첫번째 달</option>
                              <option value="m2">1분기 두번째 달</option>
                              <option value="m3">1분기 세번째 달</option>
                            </>
                          )}
                          {formData.quarterId === 'q2' && (
                            <>
                              <option value="m4">2분기 첫번째 달</option>
                              <option value="m5">2분기 두번째 달</option>
                              <option value="m6">2분기 세번째 달</option>
                            </>
                          )}
                          {formData.quarterId === 'q3' && (
                            <>
                              <option value="m7">3분기 첫번째 달</option>
                              <option value="m8">3분기 두번째 달</option>
                              <option value="m9">3분기 세번째 달</option>
                            </>
                          )}
                          {formData.quarterId === 'q4' && (
                            <>
                              <option value="m10">4분기 첫번째 달</option>
                              <option value="m11">4분기 두번째 달</option>
                              <option value="m12">4분기 세번째 달</option>
                            </>
                          )}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          주차
                        </label>
                        <select
                          name="weekId"
                          value={formData.weekId}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">선택하세요</option>
                          <option value="w1">1주차</option>
                          <option value="w2">2주차</option>
                          <option value="w3">3주차</option>
                          <option value="w4">4주차</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      스크립트
                    </label>
                    <textarea
                      name="script"
                      value={formData.script}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      rows="3"
                      placeholder="따라해 볼 스크립트를 입력하세요."
                    />
                  </div>
                  
                  {formData.type === 'library' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          재생 시간
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                          placeholder="예: 2:30"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          조회수
                        </label>
                        <input
                          type="number"
                          name="views"
                          value={formData.views}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? '처리 중...' : '비디오 추가'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'manage' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">비디오 관리</h2>
            
            {/* 검색 필터 */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-gray-700 font-medium mb-3">비디오 검색</h3>
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
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {videos.map((video) => (
                  <div key={video.id} className="border rounded-lg p-4 flex flex-col md:flex-row">
                    <div className="md:w-48 flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 flex items-center justify-center rounded">
                          <span className="text-3xl">{video.icon || '🎬'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium">{video.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                      <div className="text-sm text-gray-500">
                        유형: {video.type === 'lesson' ? '주차별 수업' : '영상 자료실'}
                        {video.type === 'lesson' && (
                          <> | 월: {video.monthId} | 주차: {video.weekId}</>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4 md:mt-0">
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        삭제
                      </button>
                    </div>
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
        )}
      </div>
    </main>
  );
} 