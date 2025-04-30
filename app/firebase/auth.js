'use client';

import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';

// 이메일 및 비밀번호로 로그인
export const loginWithEmail = async (email, password) => {
  try {
    if (!auth) throw new Error('인증 인스턴스가 초기화되지 않았습니다');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 로그아웃
export const logoutUser = async () => {
  try {
    if (!auth) throw new Error('인증 인스턴스가 초기화되지 않았습니다');
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 현재 인증된 사용자 가져오기
export const getCurrentUser = () => {
  if (!auth) return null;
  return auth.currentUser;
};

// 사용자 인증 상태 관찰
export const authStateListener = (callback) => {
  if (!auth) return () => {}; // 빈 unsubscribe 함수 반환
  return onAuthStateChanged(auth, callback);
}; 