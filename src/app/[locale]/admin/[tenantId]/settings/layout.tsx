import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsSidebar } from '@/components/common/setting/settings-sidebar';

export async function generateMetadata(props: { params: Promise<{ locale: string; tenantId: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

  return {
    title: `${t('pages.settings.title')} - ${t('brandName')}`,
    description: t('pages.settings.description'),
  };
}

interface SettingsLayoutProps {
  children: React.ReactNode;

  params: Promise<{ tenantId: string }>;
}

export default async function SettingsLayout({ children, params }: SettingsLayoutProps) {
  const { tenantId } = await params;
  return (
    <div className="flex flex-1">
      {/* Sidebar with ScrollArea */}
      <SettingsSidebar tenantId={tenantId} />

      {/* Content with ScrollArea */}
      <div className="flex-1">
        <ScrollArea className="h-full w-full">
          <div className="p-4">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}
