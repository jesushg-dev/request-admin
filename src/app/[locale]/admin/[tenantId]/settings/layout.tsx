import { Metadata } from 'next';

import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsSidebar } from '@/components/common/setting/settings-sidebar';

export const metadata: Metadata = {
  title: 'Forms',
  description: 'Advanced form example using react-hook-form and Zod.',
};

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
