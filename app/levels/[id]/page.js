'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

const levelColors = {
  1: 'bg-yellow-100',
  2: 'bg-green-100',
  3: 'bg-blue-100',
  4: 'bg-purple-100',
  5: 'bg-pink-100',
  6: 'bg-red-100'
};

const levelIcons = {
  1: '🐰',
  2: '🐻',
  3: '🦊',
  4: '🦁',
  5: '🐯',
  6: '🦄'
};

const quarters = [
  {
    id: 'q1',
    title: '1분기',
    months: [
      { id: 'm1', title: '1분기 첫번째 달', icon: '📅' },
      { id: 'm2', title: '1분기 두번째 달', icon: '📅' },
      { id: 'm3', title: '1분기 세번째 달', icon: '📅' }
    ],
    videoLibrary: { id: 'videos', title: '1분기 영상 자료실', icon: '🎥' }
  },
  {
    id: 'q2',
    title: '2분기',
    months: [
      { id: 'm4', title: '2분기 첫번째 달', icon: '📅' },
      { id: 'm5', title: '2분기 두번째 달', icon: '📅' },
      { id: 'm6', title: '2분기 세번째 달', icon: '📅' }
    ],
    videoLibrary: { id: 'videos', title: '2분기 영상 자료실', icon: '🎥' }
  },
  {
    id: 'q3',
    title: '3분기',
    months: [
      { id: 'm7', title: '3분기 첫번째 달', icon: '📅' },
      { id: 'm8', title: '3분기 두번째 달', icon: '📅' },
      { id: 'm9', title: '3분기 세번째 달', icon: '📅' }
    ],
    videoLibrary: { id: 'videos', title: '3분기 영상 자료실', icon: '🎥' }
  },
  {
    id: 'q4',
    title: '4분기',
    months: [
      { id: 'm10', title: '4분기 첫번째 달', icon: '📅' },
      { id: 'm11', title: '4분기 두번째 달', icon: '📅' },
      { id: 'm12', title: '4분기 세번째 달', icon: '📅' }
    ],
    videoLibrary: { id: 'videos', title: '4분기 영상 자료실', icon: '🎥' }
  }
];

export default function LevelDetail() {
  const params = useParams();

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-comic"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>

        <div className={`${levelColors[params.id]} rounded-2xl p-6 mb-8 border-4 border-white shadow-lg`}>
          <div className="text-6xl mb-4">{levelIcons[params.id]}</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-comic">
            레벨 {params.id}
          </h1>
          <p className="text-xl text-gray-600 font-comic">
            즐겁게 영어를 배워봐요!
          </p>
        </div>

        <div className="space-y-8">
          {quarters.map((quarter) => (
            <div key={quarter.id} className="bg-white rounded-2xl p-6 border-4 border-white shadow-lg">
              <h2 className="text-3xl font-bold text-purple-600 mb-6 font-comic">
                {quarter.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quarter.months.map((month) => (
                  <Link
                    key={month.id}
                    href={`/levels/${params.id}/${quarter.id}/${month.id}`}
                    className="block"
                  >
                    <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
                      <div className="text-3xl mb-2">{month.icon}</div>
                      <h3 className="text-lg font-bold text-gray-800 font-comic">
                        {month.title}
                      </h3>
                    </div>
                  </Link>
                ))}
                
                <Link
                  href={`/levels/${params.id}/${quarter.id}/videos`}
                  className="block"
                >
                  <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors">
                    <div className="text-3xl mb-2">{quarter.videoLibrary.icon}</div>
                    <h3 className="text-lg font-bold text-gray-800 font-comic">
                      {quarter.videoLibrary.title}
                    </h3>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 