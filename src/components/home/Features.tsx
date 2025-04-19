import { ClipboardList, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function Features() {
  const t = await getTranslations('home.features');

  const features = [
    {
      name: t('requestManagement.title'),
      description: t('requestManagement.description'),
      icon: ClipboardList,
    },
    {
      name: t('multichannelSupport.title'),
      description: t('multichannelSupport.description'),
      icon: MessageSquare,
    },
    {
      name: t('dataProtection.title'),
      description: t('dataProtection.description'),
      icon: ShieldCheck,
    },
    {
      name: t('quickResponse.title'),
      description: t('quickResponse.description'),
      icon: Zap,
    },
  ];

  return (
    <section className="container space-y-16 py-24 md:py-32">
      <div className="mx-auto max-w-[58rem] text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">{t('title')}</h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">{t('subtitle')}</p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.name} className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex items-center gap-4">
              <feature.icon className="h-8 w-8" />
              <h3 className="font-bold">{feature.name}</h3>
            </div>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
