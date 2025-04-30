'use client';

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
  serverTimestamp,
  getFirestore,
  setDoc
} from 'firebase/firestore';

// db가 null인 경우를 확인하는 함수
const checkDb = () => {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다. 클라이언트 사이드에서만 이 함수를 호출해주세요.');
  }
  return db;
};

// 비디오 컬렉션 참조 가져오는 함수
const getVideosCollection = () => {
  const dbInstance = checkDb();
  return collection(dbInstance, 'videos');
};

// 사용자 컬렉션 참조 가져오는 함수
const getUsersCollection = () => {
  const dbInstance = checkDb();
  return collection(dbInstance, 'users');
};

// 새 사용자 데이터 생성
export async function createUserData(uid, userData) {
  try {
    const dbInstance = checkDb();
    const userRef = doc(dbInstance, 'users', uid);
    
    const userDataWithTimestamp = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, userDataWithTimestamp);
    return { uid, ...userDataWithTimestamp };
  } catch (error) {
    console.error('사용자 데이터 생성 오류:', error);
    throw error;
  }
}

// 사용자 데이터 가져오기
export async function getUserData(uid) {
  try {
    const dbInstance = checkDb();
    const userRef = doc(dbInstance, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('사용자 데이터 불러오기 오류:', error);
    throw error;
  }
}

// 사용자 데이터 업데이트
export async function updateUserData(uid, updateData) {
  try {
    const dbInstance = checkDb();
    const userRef = doc(dbInstance, 'users', uid);
    
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return { uid, ...updateData };
  } catch (error) {
    console.error('사용자 데이터 업데이트 오류:', error);
    throw error;
  }
}

// 분기별 영상 자료실 비디오 가져오기
export async function getQuarterVideos(levelId, quarterId) {
  try {
    const videosCollectionRef = getVideosCollection();
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
    
    // 제목(title)을 기준으로 오름차순 정렬
    return videos.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
  } catch (error) {
    console.error('분기별 영상 불러오기 오류:', error);
    throw error;
  }
}

// 주차별 수업 비디오 가져오기
export async function getWeekVideos(levelId, quarterId, monthId, weekId) {
  try {
    const videosCollectionRef = getVideosCollection();
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
    
    // 제목(title)을 기준으로 오름차순 정렬
    return videos.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
  } catch (error) {
    console.error('주차별 영상 불러오기 오류:', error);
    throw error;
  }
}

// 새 비디오 추가
export async function addVideo(videoData) {
  try {
    const videosCollectionRef = getVideosCollection();
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
    const dbInstance = checkDb();
    const videoRef = doc(dbInstance, 'videos', videoId);
    
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
    const dbInstance = checkDb();
    const videoRef = doc(dbInstance, 'videos', videoId);
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
    const dbInstance = checkDb();
    const videoRef = doc(dbInstance, 'videos', videoId);
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