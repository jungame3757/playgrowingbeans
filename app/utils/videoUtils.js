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
export async function handleVideoDownload(videoUrl, title) {
  try {
    // 로딩 상태 표시
    window.dispatchEvent(new CustomEvent('download-started', { detail: { title } }));
    
    // m3u8 URL 형태:
    // .../videos/레벨1/1분기/hls/0. 복습 영상/0. 복습 영상.m3u8
    
    // 실제 mp4 경로:
    // .../videos/레벨1/1분기/0. 복습 영상.mp4
    
    // 비디오 URL에서 필요한 정보 추출 (수정된 로직)
    const urlParts = videoUrl.split('/videos/')[1];
    const hlsIndex = urlParts.indexOf('/hls/');
    
    if (hlsIndex === -1) {
      throw new Error('올바른 HLS 비디오 URL 형식이 아닙니다');
    }
    
    // 기본 폴더 경로 (레벨1/1분기)
    const basePath = urlParts.substring(0, hlsIndex);
    
    // 파일명 추출 (/hls/ 이후 마지막 / 이후의 .m3u8 앞부분)
    const afterHls = urlParts.substring(hlsIndex + 5); // '/hls/' 다음 부분
    const lastSlashIndex = afterHls.lastIndexOf('/');
    
    let fileName;
    if (lastSlashIndex !== -1) {
      // /hls/ 다음에 폴더가 있는 경우 (일반적인 경우)
      fileName = afterHls.substring(lastSlashIndex + 1, afterHls.lastIndexOf('.m3u8'));
    } else {
      // /hls/ 다음에 바로 파일명이 오는 경우
      fileName = afterHls.substring(0, afterHls.lastIndexOf('.m3u8'));
    }
    
    // 최종 mp4 파일 경로 생성
    const originalPath = `${basePath}/${fileName}`;
    
    console.log('HLS URL:', videoUrl);
    console.log('추출한 기본 경로:', basePath);
    console.log('추출한 파일명:', fileName);
    console.log('요청할 비디오 경로:', originalPath);
    
    // 백엔드 API를 통한 다운로드 요청
    const response = await fetch('/api/download-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoPath: originalPath,
        fileName: `${fileName}.mp4`
      })
    });
    
    if (!response.ok) {
      throw new Error('다운로드 중 오류가 발생했습니다');
    }
    
    // 서명된 URL 방식 사용
    const data = await response.json();
    
    if (data.downloadUrl) {
      // 다운로드 링크 생성 및 클릭
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `${title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 다운로드 완료 이벤트
      window.dispatchEvent(new CustomEvent('download-completed', { detail: { title } }));
    } else if (data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('비디오 다운로드 오류:', error);
    window.dispatchEvent(new CustomEvent('download-error', { 
      detail: { title, error: error.message } 
    }));
    alert(`다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
} 