// Firebase 설정 파일
// Firebase 콘솔에서 가져온 구성으로 아래 설정을 교체하세요
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCZrKm6PAuNBGvJDCtXs6ldtRSkw4FTNHM",
    authDomain: "quiztest-8600d.firebaseapp.com",
    databaseURL: "https://quiztest-8600d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "quiztest-8600d",
    storageBucket: "quiztest-8600d.firebasestorage.app",
    messagingSenderId: "1001508556525",
    appId: "1:1001508556525:web:24c5dbc5ec30ba1876c6e4"
  };

// Firebase 인스턴스가 없을 경우에만 초기화
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage }; 