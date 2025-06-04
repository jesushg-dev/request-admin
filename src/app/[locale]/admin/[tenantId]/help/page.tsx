'use client';

import type React from 'react';
import { useState, useTransition } from 'react';
import { BookOpen, HelpCircle, MessageSquare, Search, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ContactTab } from './_components/contact-tab';
import { FaqsTab } from './_components/faqs-tab';
import { GuidesTab } from './_components/guides-tab';
import { VideosTab } from './_components/videos-tab';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('guides');
  const [, startTransition] = useTransition();

  const t = useTranslations('admin.helpPage');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const handleTabChange = (value: string) => {
    startTransition(() => {
      setActiveTab(value);
    });
  };

  return (
    <div className="container py-6 flex flex-col h-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t('searchPlaceholder')} className="pl-10" value={searchQuery} onChange={handleSearch} />
        </div>
      </div>

      <div className="mt-8 flex flex-col flex-grow min-h-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-grow min-h-0">
          <TabsList className="mb-4">
            <TabsTrigger value="guides">
              <BookOpen className="mr-2 h-4 w-4" />
              {t('tabs.guides')}
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="mr-2 h-4 w-4" />
              {t('tabs.videos')}
            </TabsTrigger>
            <TabsTrigger value="faqs">
              <HelpCircle className="mr-2 h-4 w-4" />
              {t('tabs.faqs')}
            </TabsTrigger>
            <TabsTrigger value="contact">
              <MessageSquare className="mr-2 h-4 w-4" />
              {t('tabs.contact')}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-grow min-h-0">
            <TabsContent value="guides" className="h-full overflow-y-auto">
              <GuidesTab />
            </TabsContent>

            <TabsContent value="videos" className="h-full overflow-y-auto">
              <VideosTab />
            </TabsContent>

            <TabsContent value="contact" className="h-full overflow-y-auto">
              <ContactTab />
            </TabsContent>

            <TabsContent value="faqs" className="h-full overflow-y-auto">
              <FaqsTab />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
