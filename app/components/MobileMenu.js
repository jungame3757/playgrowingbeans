'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-purple-600"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 w-48 bg-white rounded-lg shadow-lg py-2">
          <Link
            href="/"
            className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 font-comic"
            onClick={() => setIsOpen(false)}
          >
            홈
          </Link>
          <Link
            href="/levels/1"
            className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 font-comic"
            onClick={() => setIsOpen(false)}
          >
            레벨
          </Link>
          <Link
            href="/about"
            className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 font-comic"
            onClick={() => setIsOpen(false)}
          >
            소개
          </Link>
          <Link
            href="/contact"
            className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 font-comic"
            onClick={() => setIsOpen(false)}
          >
            문의하기
          </Link>
          <Link
            href="/admin"
            className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 font-comic"
            onClick={() => setIsOpen(false)}
          >
            관리자
          </Link>
        </div>
      )}
    </div>
  );
} 