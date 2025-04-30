// 공통 상수
export const quarterNames = {
  q1: '1분기',
  q2: '2분기',
  q3: '3분기',
  q4: '4분기'
};

export const monthNames = {
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

export const weekNames = {
  w1: '1주차',
  w2: '2주차',
  w3: '3주차',
  w4: '4주차'
};

// 비디오 다운로드 헬퍼 함수
export function handleVideoDownload(videoUrl, title) {
  // HLS 스트리밍 URL을 MP4 URL로 변환
  const mp4Url = videoUrl.replace('.m3u8', '.mp4').replace('/hls/', '/');
  
  // 다운로드 링크 생성 및 클릭
  const link = document.createElement('a');
  link.href = mp4Url;
  link.download = `${title}.mp4`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 