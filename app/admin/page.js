'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/auth';
import Dashboard from '../components/admin/Dashboard';
import VideoAddForm from '../components/admin/VideoAddForm';
import VideoManage from '../components/admin/VideoManage';

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState({ text: '', type: '' });

  // 인증 상태 확인 및 리디렉션
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      setMessage({
        text: '로그아웃 처리 중 오류가 발생했습니다.',
        type: 'error'
      });
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      {authLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="spinner"></div>
          <p className="ml-2">로딩 중...</p>
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-xl mb-4">관리자 로그인이 필요합니다</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-purple-600">관리자 페이지</h1>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
            
            <div className="mt-6 border-b border-gray-200">
              <nav className="flex flex-wrap -mb-px">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  대시보드
                </button>
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
          
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'add' && <VideoAddForm />}
          {activeTab === 'manage' && <VideoManage />}
        </div>
      )}
    </main>
  );
} 