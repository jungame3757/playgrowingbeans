'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, authStateListener } from '../firebase/auth';
import { getUserData } from '../firebase/firestore';

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 인증 제공자 컴포넌트
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 서버 사이드 렌더링 중에는 실행하지 않음
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      // 인증 상태 리스너 설정
      const unsubscribe = authStateListener(async (authUser) => {
        if (authUser) {
          // Firestore에서 사용자 정보 가져오기
          try {
            const userInfo = await getUserData(authUser.uid);
            setUser(authUser);
            setUserData(userInfo);
          } catch (error) {
            console.error('사용자 데이터 가져오기 오류:', error);
            setUser(authUser);
            setUserData(null);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      });

      // 컴포넌트 언마운트 시 리스너 제거
      return () => unsubscribe && unsubscribe();
    } catch (error) {
      console.error('인증 상태 리스너 설정 중 오류 발생:', error);
      setLoading(false);
      return () => {};
    }
  }, []);

  // 역할 기반 권한 확인 함수
  const hasRole = (requiredRole) => {
    if (!userData) return false;
    if (requiredRole === 'admin') return userData.role === 'admin';
    if (requiredRole === 'teacher') return userData.role === 'admin' || userData.role === 'teacher';
    if (requiredRole === 'student') return userData.role === 'admin' || userData.role === 'teacher' || userData.role === 'student';
    return false;
  };

  // 컨텍스트 값 정의
  const value = {
    user,
    userData,
    loading,
    isAdmin: userData?.role === 'admin',
    isTeacher: userData?.role === 'teacher',
    isStudent: userData?.role === 'student',
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 인증 컨텍스트 사용을 위한 훅
export function useAuth() {
  return useContext(AuthContext);
} 