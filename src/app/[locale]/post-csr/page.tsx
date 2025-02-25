'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { getPost } from '@/services/post';

import PostContent from '@/components/tip-tap/PostContent';
import PostHeader from '@/components/tip-tap/PostHeader';
import PostReadingProgress from '@/components/tip-tap/PostReadingProgress';
import PostSharing from '@/components/tip-tap/PostSharing';
import PostToc from '@/components/tip-tap/PostToc';
import TiptapRenderer from '@/components/tip-tap/TiptapRenderer/ClientRenderer';

export default function PostPage() {
  interface Post {
    title: string;
    author: string;
    createdAt: string;
    wordCount: number;
    cover: string;
    content: string;
  }

  const [post, setPost] = useState<Post | null>(null);

  const readingTime = useMemo(() => {
    const wpm = 150;
    return Math.ceil((post?.wordCount ?? 0) / wpm);
  }, [post]);

  useEffect(() => {
    getPost().then(setPost);
  }, []);

  if (!post) return null;

  return (
    <article className="py-10 px-6 flex flex-col items-center ">
      <PostReadingProgress />
      <PostHeader title={post.title} author={post.author} createdAt={post.createdAt} readingTime={readingTime} cover={post.cover} />
      <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-8">
        <PostSharing />
        <PostContent>
          <TiptapRenderer>{post.content}</TiptapRenderer>
        </PostContent>
        <PostToc />
      </div>
      <Image src={'/doraemon.png'} width={350} height={350} alt="" className="mx-auto mt-20" />
    </article>
  );
}
