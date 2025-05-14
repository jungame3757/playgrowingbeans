'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/auth';
import Dashboard from '../components/admin/Dashboard';
import VideoAddForm from '../components/admin/VideoAddForm';
import VideoManage from '../components/admin/VideoManage';
import TeacherManage from '../components/admin/TeacherManage';

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, authLoading, router, isAdmin]);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'videos':
        return <VideoManage />;
      case 'add-video':
        return <VideoAddForm />;
      case 'teachers':
        return <TeacherManage />;
      default:
        return <Dashboard />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
        <p className="ml-2">로딩 중...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl mb-4">관리자 권한이 필요합니다</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-600">관리자 페이지</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                대시보드
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`${
                  activeTab === 'videos'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                영상 관리
              </button>
              <button
                onClick={() => setActiveTab('add-video')}
                className={`${
                  activeTab === 'add-video'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                영상 추가
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`${
                  activeTab === 'teachers'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                선생님 관리
              </button>
            </nav>
          </div>
          <div className="p-6">
            {message.text && (
              <div
                className={`mb-4 p-4 rounded ${
                  message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {message.text}
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 