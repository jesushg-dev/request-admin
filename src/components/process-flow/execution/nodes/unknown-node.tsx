import { type FC } from 'react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UnknownNodeProps {
  node: {
    id: string;
    type?: string;
  };
  level: number;
}

const UnknownNode: FC<UnknownNodeProps> = ({ node, level }) => {
  const t = useTranslations('component.flowExecution.execution');
  return (
    <Card className="flex-1 mb-4 bg-red-100 border-t-4 border-red-500 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-red-800 dark:text-red-200">{t('unknownNode.title')}</CardTitle>
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{t('unknownNode.error')}</Badge>
        </div>
        <CardDescription className="text-red-600 dark:text-red-300">{t('unknownNode.description', { type: node.type ?? 'N/A' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-600 dark:text-red-300">{t('unknownNode.id', { id: node.id })}</p>
        <p className="text-sm text-red-600 dark:text-red-300">{t('unknownNode.level', { level })}</p>
      </CardContent>
    </Card>
  );
};

export default UnknownNode;
