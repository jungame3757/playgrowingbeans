'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function AdminButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // 로딩 중에는 아무것도 표시하지 않음
  }

  return (
    <Link
      href={user ? '/admin' : '/login'}
      className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      {user ? '관리자 페이지' : '관리자 로그인'}
    </Link>
  );
} 