import Link from 'next/link';

const levels = [
  { id: 1, title: '레벨 1', description: '기초 영어 학습', color: 'bg-yellow-100', icon: '🐰' },
  { id: 2, title: '레벨 2', description: '초급 영어 학습', color: 'bg-green-100', icon: '🐻' },
  { id: 3, title: '레벨 3', description: '중급 영어 학습', color: 'bg-blue-100', icon: '🦊' },
  { id: 4, title: '레벨 4', description: '고급 영어 학습', color: 'bg-purple-100', icon: '🦁' },
  { id: 5, title: '레벨 5', description: '실전 영어 학습', color: 'bg-pink-100', icon: '🐯' },
  { id: 6, title: '레벨 6', description: '영어 마스터', color: 'bg-red-100', icon: '🦄' },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-600 mb-4 font-comic">
            Growing Beans English
          </h1>
          <p className="text-2xl text-gray-600 font-comic">
            Let&apos;s Learn English Together! 🎨
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {levels.map((level) => (
            <Link 
              href={`/levels/${level.id}`}
              key={level.id}
              className="block transform hover:scale-105 transition-transform duration-300"
            >
              <div className={`${level.color} rounded-2xl shadow-lg p-6 border-4 border-white`}>
                <div className="text-4xl mb-4">{level.icon}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 font-comic">{level.title}</h2>
                <p className="text-gray-600 text-lg">{level.description}</p>
                <div className="mt-4 flex items-center text-purple-600">
                  <span className="text-lg font-comic">Let&apos;s Start!</span>
                  <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
