import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { AuthProvider } from './contexts/AuthContext';
import AdminButton from './components/AdminButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '그로잉 빈즈 - 영어 학습',
  description: '어린이를 위한 즐거운 영어 학습 플랫폼',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
            <header className="bg-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center">
                    <Link href="/" className="flex items-center">
                      <span className="text-4xl mr-2">🌱</span>
                      <span className="text-2xl font-bold text-purple-600 font-comic">그로잉 빈즈</span>
                    </Link>
                  </div>
                  <AdminButton />
                </div>
              </div>
            </header>
            <main>{children}</main>
            <footer className="bg-white mt-12">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <div className="text-gray-600 font-comic">
                    © 2025 그로잉 빈즈. All rights reserved.
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
