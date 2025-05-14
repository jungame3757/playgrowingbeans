'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function AdminButton() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return null; // 로딩 중에는 아무것도 표시하지 않음
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        로그인
      </Link>
    );
  }

  if (isAdmin) {
    return (
      <Link
        href="/admin"
        className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        관리자 페이지
      </Link>
    );
  }

  return null;
} 