'use client';

export function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-bounce text-5xl mb-4">🔄</div>
      <p className="text-gray-600 font-comic">영상을 불러오고 있어요...</p>
    </div>
  );
}

export function ErrorState({ error }) {
  return (
    <div className="text-center py-12 bg-white rounded-2xl p-6 border-4 border-white shadow-lg">
      <div className="text-5xl mb-4">😕</div>
      <p className="text-gray-600 font-comic">
        {error || '데이터를 불러오는 중 오류가 발생했습니다.'}
      </p>
      <p className="text-gray-600 font-comic mt-2">
        나중에 다시 시도해주세요.
      </p>
    </div>
  );
}

export function EmptyState({ type, quarter }) {
  return (
    <div className="text-center py-12 bg-white rounded-2xl p-8 border-4 border-white shadow-lg">
      <div className="text-6xl mb-4">📭</div>
      <h2 className="text-2xl font-bold text-gray-600 mb-4 font-comic">
        아직 {type || '영상'} 자료가 없어요
      </h2>
      <p className="text-gray-500 font-comic mb-2">
        {quarter} {type || '영상'} 자료를 준비 중이에요.
      </p>
      <p className="text-gray-500 font-comic">
        조금만 기다려주세요!
      </p>
    </div>
  );
} 