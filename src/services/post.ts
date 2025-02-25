import { mock } from '@/sample';

interface Post {
  title: string;
  content: string;
  wordCount: number;
  author: string;
  createdAt: string;
  cover: string;
}

export const getPost = (): Promise<Post> => {
  return new Promise<Post>((resolve) => {
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          const data = localStorage.getItem('post');
          resolve(data ? JSON.parse(data) : mock);
          if (!data) savePost(mock);
        } catch {
          resolve(mock);
        }
      }

      return resolve(mock);
    }, 200);
  });
};

export const savePost = (data: Post) => {
  if (typeof window === 'undefined') return;

  try {
    const value = data?.content?.trim() ? { ...mock, ...data } : mock;
    localStorage.setItem('post', JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};
