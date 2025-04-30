// Firebase 설정 파일
// Firebase 콘솔에서 가져온 구성으로 아래 설정을 교체하세요
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyARLoCaF3g_z_RcZdU7yp19rgt7YSghGWw",
  authDomain: "growingbeans-3aa62.firebaseapp.com",
  projectId: "growingbeans-3aa62",
  storageBucket: "growingbeans-3aa62.firebasestorage.app",
  messagingSenderId: "498344379382",
  appId: "1:498344379382:web:684c82f8f8ab7084a67dd7",
  measurementId: "G-NJD4T1QKKQ"
};

// Firebase 초기화 함수
function initializeFirebase() {
  if (typeof window !== 'undefined' && getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }

  return getApps().length > 0 ? getApps()[0] : null;
}

// 애플리케이션 초기화
const app = initializeFirebase();

// 서비스 초기화
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;
const auth = app ? getAuth(app) : null;

export { db, storage, auth }; 