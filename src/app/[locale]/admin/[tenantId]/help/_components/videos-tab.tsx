import { Video } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function VideosTab() {
  const t = useTranslations('admin.helpPage.videos');

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>{t('introduction.title')}</CardTitle>
          </div>
          <CardDescription>{t('introduction.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
            <Video className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <Badge>{t('introduction.duration')}</Badge>
            <p className="mt-2 text-sm text-muted-foreground">{t('introduction.detail')}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" className="w-full">
            {t('watchButton')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>{t('requestCreation.title')}</CardTitle>
          </div>
          <CardDescription>{t('requestCreation.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
            <Video className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <Badge>{t('requestCreation.duration')}</Badge>
            <p className="mt-2 text-sm text-muted-foreground">{t('requestCreation.detail')}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" className="w-full">
            {t('watchButton')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>{t('workflows.title')}</CardTitle>
          </div>
          <CardDescription>{t('workflows.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
            <Video className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <Badge>{t('workflows.duration')}</Badge>
            <p className="mt-2 text-sm text-muted-foreground">{t('workflows.detail')}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" className="w-full">
            {t('watchButton')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>{t('reports.title')}</CardTitle>
          </div>
          <CardDescription>{t('reports.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
            <Video className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <Badge>{t('reports.duration')}</Badge>
            <p className="mt-2 text-sm text-muted-foreground">{t('reports.detail')}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" className="w-full">
            {t('watchButton')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>{t('userManagement.title')}</CardTitle>
          </div>
          <CardDescription>{t('userManagement.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
            <Video className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <Badge>{t('userManagement.duration')}</Badge>
            <p className="mt-2 text-sm text-muted-foreground">{t('userManagement.detail')}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" className="w-full">
            {t('watchButton')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>{t('notifications.title')}</CardTitle>
          </div>
          <CardDescription>{t('notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
            <Video className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <Badge>{t('notifications.duration')}</Badge>
            <p className="mt-2 text-sm text-muted-foreground">{t('notifications.detail')}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" className="w-full">
            {t('watchButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
