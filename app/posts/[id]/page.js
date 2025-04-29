'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PostDetail() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: API에서 게시물 데이터 가져오기
    const fetchPost = async () => {
      try {
        // 임시 데이터
        const mockPost = {
          id: params.id,
          title: '첫 번째 동영상 게시물',
          content: '이 게시물에는 여러 개의 동영상이 포함되어 있습니다. 각 동영상은 자유롭게 설명과 함께 추가할 수 있습니다.',
          videos: [
            {
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              description: '첫 번째 동영상입니다.'
            },
            {
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              description: '두 번째 동영상입니다.'
            }
          ],
          createdAt: '2024-04-29'
        };
        setPost(mockPost);
      } catch (error) {
        console.error('게시물을 불러오는 중 오류가 발생했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p>게시물을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <article className="space-y-8">
          <header>
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
          </header>

          <div className="prose max-w-none">
            <p className="text-gray-700">{post.content}</p>
          </div>

          <div className="space-y-8">
            {post.videos.map((video, index) => (
              <div key={index} className="space-y-4">
                <div className="aspect-video">
                  <iframe
                    src={video.url}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">{video.description}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
} 