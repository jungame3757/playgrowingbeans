'use client';

import { useState, useEffect } from 'react';
import { addVideo } from '../../firebase/firestore';

export default function VideoAddForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    levelId: '1',
    quarterId: 'q1',
    monthId: '',
    weekId: '',
    type: 'lesson'
  });
  const [rawVideoPath, setRawVideoPath] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 비디오 경로 변환 핸들러
  const handleVideoPathChange = (e) => {
    const value = e.target.value;
    setRawVideoPath(value);
    
    // 경로 변환 로직
    if (value) {
      const cloudFrontUrl = convertToCloudFrontUrl(value);
      setFormData(prev => ({
        ...prev,
        videoUrl: cloudFrontUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        videoUrl: ''
      }));
    }
  };

  // 로컬 경로를 CloudFront URL로 변환하는 함수
  const convertToCloudFrontUrl = (localPath) => {
    try {
      // 백슬래시를 슬래시로 변환
      let normalizedPath = localPath.replace(/\\/g, '/');
      
      // AWSM3 이후의 경로 추출
      const awsm3Index = normalizedPath.indexOf('AWSM3');
      if (awsm3Index === -1) {
        return '';
      }
      
      let relativePath = normalizedPath.substring(awsm3Index + 6); // 'AWSM3/' 이후의 경로
      
      // 파일 이름 추출 (확장자 제외)
      const lastSlashIndex = relativePath.lastIndexOf('/');
      const fileName = relativePath.substring(lastSlashIndex + 1);
      const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      
      // 디렉토리 경로 추출
      const directoryPath = relativePath.substring(0, lastSlashIndex);
      
      // CloudFront URL 구성
      const cloudFrontUrl = `https://d3asw5knevel36.cloudfront.net/videos/${directoryPath}/hls/${fileNameWithoutExt}/${fileNameWithoutExt}.m3u8`;
      
      return cloudFrontUrl;
    } catch (error) {
      console.error('경로 변환 오류:', error);
      return '';
    }
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
        levelId: '1',
        quarterId: 'q1',
        monthId: '',
        weekId: '',
        type: 'lesson'
      });
      setRawVideoPath('');
      
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 비디오 추가</h2>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' :
          message.type === 'error' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {message.text}
        </div>
      )}
      
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
                로컬 비디오 경로 
              </label>
              <input
                type="text"
                value={rawVideoPath}
                onChange={handleVideoPathChange}
                className="w-full p-2 border rounded"
                placeholder="C:\Users\...\AWSM3\레벨1\1분기\파일명.mp4"
              />
              <p className="text-xs text-gray-500 mt-1">로컬 경로 입력 시 자동으로 CloudFront URL로 변환됩니다.</p>
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
                className="w-full p-2 border rounded bg-gray-50"
                placeholder="https://d3asw5knevel36.cloudfront.net/videos/.../파일명.m3u8"
                required
              />
              <p className="text-xs text-gray-500 mt-1">위 로컬 경로에서 변환된 URL 또는 직접 입력하세요.</p>
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
  );
} 