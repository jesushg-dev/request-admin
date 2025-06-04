import Link from 'next/link';
import { BookOpen, FileText, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function GuidesTab() {
  const t = useTranslations('admin.helpPage.guides');

  const requestManagementLinks = t.raw('requestManagement.links') as string[];
  const communicationLinks = t.raw('communication.links') as string[];
  const reportsLinks = t.raw('reports.links') as string[];
  const administrationLinks = t.raw('administration.links') as string[];
  const workflowsLinks = t.raw('workflows.links') as string[];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>{t('firstSteps.title')}</CardTitle>
          </div>
          <CardDescription>{t('firstSteps.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                {t('firstSteps.links.0')}
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                {t('firstSteps.links.1')}
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                {t('firstSteps.links.2')}
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                {t('firstSteps.links.3')}
              </Link>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="#">{t('firstSteps.viewAll')}</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>{t('requestManagement.title')}</CardTitle>
          </div>
          <CardDescription>{t('requestManagement.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {requestManagementLinks.map((link, index) => (
              <li key={index}>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="#">{t('requestManagement.viewAll')}</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>{t('communication.title')}</CardTitle>
          </div>
          <CardDescription>{t('communication.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {communicationLinks.map((link, index) => (
              <li key={index}>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="#">{t('communication.viewAll')}</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>{t('reports.title')}</CardTitle>
          </div>
          <CardDescription>{t('reports.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {reportsLinks.map((link, index) => (
              <li key={index}>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="#">{t('reports.viewAll')}</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>{t('administration.title')}</CardTitle>
          </div>
          <CardDescription>{t('administration.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {administrationLinks.map((link, index) => (
              <li key={index}>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="#">{t('administration.viewAll')}</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>{t('workflows.title')}</CardTitle>
          </div>
          <CardDescription>{t('workflows.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {workflowsLinks.map((link, index) => (
              <li key={index}>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="#">{t('workflows.viewAll')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
