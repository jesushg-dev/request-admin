import { type FC } from 'react';
import { BookOpen, FileText, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RequestDetailsType } from '@/types/prisma/request';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmptyState from '@/components/shared/empty-state';

interface GuidesViewerProps {
  guides: RequestDetailsType['guides'];
}

const GuidesViewer: FC<GuidesViewerProps> = ({ guides }) => {
  const t = useTranslations('admin.request.view.guidesViewer');

  return (
    <div className="flex flex-1 flex-col justify-between gap-4 overflow-hidden">
      {guides.length > 0 ? (
        <ScrollArea>
          <div className="grid gap-4 md:grid-cols-2 px-1">
            {guides.map((guide) => (
              <Card key={guide.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {guide.fileType === 'PDF' && <FileText className="h-5 w-5 text-red-500" />}
                    {guide.fileType === 'Excel' && <FileText className="h-5 w-5 text-green-500" />}
                    {guide.fileType === 'Video' && <FileText className="h-5 w-5 text-blue-500" />}
                    <CardTitle className="text-base">{guide.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">{t('fileType')}</span>
                      <span className="font-medium">{guide.fileType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">{t('version')}</span>
                      <span className="font-medium">{guide.version}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">{t('lastUpdated')}</span>
                      <span className="font-medium">{guide.updatedAt?.toDateString()}</span>
                    </div>

                    <div>
                      <a href={guide.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                        <BookOpen className="mr-2 h-4 w-4" />
                        {t('viewGuide')}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <EmptyState title={t('noGuidesFound')} description={t('noGuidesDescription')} icons={[FileText, BookOpen, HelpCircle]} className="flex-1 flex items-center justify-center" />
      )}
    </div>
  );
};

export default GuidesViewer;
