import { db } from './config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

// 비디오 컬렉션 참조
const videosCollectionRef = collection(db, 'videos');

// 분기별 영상 자료실 비디오 가져오기
export async function getQuarterVideos(levelId, quarterId) {
  try {
    const q = query(
      videosCollectionRef,
      where('levelId', '==', levelId),
      where('quarterId', '==', quarterId),
      where('type', '==', 'library')
    );
    
    const querySnapshot = await getDocs(q);
    const videos = [];
    
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return videos;
  } catch (error) {
    console.error('분기별 영상 불러오기 오류:', error);
    throw error;
  }
}

// 주차별 수업 비디오 가져오기
export async function getWeekVideos(levelId, quarterId, monthId, weekId) {
  try {
    const q = query(
      videosCollectionRef,
      where('levelId', '==', levelId),
      where('quarterId', '==', quarterId),
      where('monthId', '==', monthId),
      where('weekId', '==', weekId),
      where('type', '==', 'lesson')
    );
    
    const querySnapshot = await getDocs(q);
    const videos = [];
    
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return videos;
  } catch (error) {
    console.error('주차별 영상 불러오기 오류:', error);
    throw error;
  }
}

// 새 비디오 추가
export async function addVideo(videoData) {
  try {
    const newVideoData = {
      ...videoData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(videosCollectionRef, newVideoData);
    return { id: docRef.id, ...newVideoData };
  } catch (error) {
    console.error('비디오 추가 오류:', error);
    throw error;
  }
}

// 비디오 정보 업데이트
export async function updateVideo(videoId, updateData) {
  try {
    const videoRef = doc(db, 'videos', videoId);
    
    await updateDoc(videoRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return { id: videoId, ...updateData };
  } catch (error) {
    console.error('비디오 업데이트 오류:', error);
    throw error;
  }
}

// 비디오 삭제
export async function deleteVideo(videoId) {
  try {
    const videoRef = doc(db, 'videos', videoId);
    await deleteDoc(videoRef);
    return { success: true, id: videoId };
  } catch (error) {
    console.error('비디오 삭제 오류:', error);
    throw error;
  }
}

// 단일 비디오 가져오기
export async function getVideoById(videoId) {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);
    
    if (videoSnap.exists()) {
      return { id: videoSnap.id, ...videoSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('비디오 정보 불러오기 오류:', error);
    throw error;
  }
} 