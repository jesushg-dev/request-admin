'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Building, FileText, ImageIcon, LinkIcon, Mail, MapPin, Package, Palette, Phone, Tag, ViewIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWatch } from 'react-hook-form';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ColorSwatch } from '@/components/ui/color-swatch';

import { TenantCreationValues } from '.';
import { Plan } from './plan-selection-step';

interface TenantReviewStepProps {
  plans: Plan[];
}

const TenantReviewStep = ({ plans }: TenantReviewStepProps) => {
  const t = useTranslations('tenants.form.tenantReviewStep');
  const data = useWatch<TenantCreationValues>();

  const selectedPlan = useMemo(() => {
    return plans.find((plan) => plan.id === data.planId);
  }, [plans, data.planId]);

  const [logoPreviewError, setLogoPreviewError] = useState(false);

  // Reset logo error state when logo URL changes
  useEffect(() => {
    setLogoPreviewError(false);
  }, [data.logo]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column: Basic + Contact */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('basicInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={<Building className="h-4 w-4 text-muted-foreground" />} label={t('basicInfo.orgName')} value={data.name || '—'} />
              <InfoRow icon={<Tag className="h-4 w-4 text-muted-foreground" />} label={t('basicInfo.slug')} value={data.slug || '—'} />
              <InfoRow
                icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
                label={t('basicInfo.logo')}
                value={
                  data.logo ? (
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted/30">
                        {!logoPreviewError ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={data.logo ?? '/placeholder.svg'} alt={`${data.name} logo`} className="object-contain h-full w-full p-1" onError={() => setLogoPreviewError(true)} />
                        ) : (
                          <ImageIcon className="h-4 w-4 m-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className="break-all text-xs text-muted-foreground">{data.logo}</span>
                    </div>
                  ) : (
                    '—'
                  )
                }
              />
              <InfoRow icon={<LinkIcon className="h-4 w-4 text-muted-foreground" />} label={t('basicInfo.websiteUrl')} value={data.websiteUrl || '—'} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('contactInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={<Mail className="h-4 w-4 text-muted-foreground" />} label={t('contactInfo.email')} value={data.contactEmail || '—'} />
              <InfoRow icon={<Phone className="h-4 w-4 text-muted-foreground" />} label={t('contactInfo.phone')} value={data.contactPhone || '—'} />
              <InfoRow icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label={t('contactInfo.address')} value={data.address || '—'} />
            </CardContent>
          </Card>
        </div>

        {/* Middle column: Content */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {t('contentInfo.contentInfoTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label={t('contentInfo.title')} value={data.title || '—'} />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('contentInfo.description')}</p>
              <p className="text-sm leading-relaxed">{data.description || '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Branding + Plan */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                {t('branding.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <ColorSwatch color={data.primaryColor} size="sm" />
                <span className="font-mono text-xs">{data.primaryColor || '—'}</span>
                <Separator orientation="vertical" className="h-5" />
                <ColorSwatch color={data.secondaryColor} size="sm" />
                <span className="font-mono text-xs">{data.secondaryColor || '—'}</span>
              </div>
              <div className="border rounded-lg overflow-hidden shadow-sm bg-background">
                <div className="bg-muted/60 border-b p-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="bg-background rounded-full text-[10px] py-1 px-2 text-muted-foreground text-center truncate">
                      {data.websiteUrl ?? `${data.slug}.example.com`}
                    </div>
                  </div>
                  <div className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded">1:1</div>
                </div>
                <div className="p-3" style={{ backgroundColor: data.primaryColor || '#0243ac' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <div className="h-8 w-8 bg-white/15 rounded flex items-center justify-center">
                        <span className="text-xs font-bold">{(data.name ?? ' ').slice(0, 2).toUpperCase()}</span>
                      </div>
                      <span className="font-semibold text-sm">{data.name || '—'}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-white/25 rounded" />
                      <div className="w-3 h-3 bg-white/25 rounded" />
                      <div className="w-3 h-3 bg-white/25 rounded" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-background">
                  <p className="text-lg font-semibold mb-1">{data.title || data.name || t('branding.preview')}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {data.description || '—'}
                  </p>
                  <div
                    className="inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold text-white shadow-sm"
                    style={{ backgroundColor: data.secondaryColor || '#297dd6' }}
                  >
                    {t('branding.getStarted')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {t('subscription.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedPlan ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedPlan.name}</span>
                    {selectedPlan.popular && <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-semibold">{t('subscription.popular')}</span>}
                  </div>
                  <p className="text-muted-foreground text-sm">{selectedPlan.description}</p>
                  <div className="text-sm">
                    <span className="font-medium">{t('subscription.price')}:</span>{' '}
                    {selectedPlan.price === 0 ? t('subscription.free') : `$${selectedPlan.price}`}
                  </div>
                  {selectedPlan.durationInDays && (
                    <div className="text-sm">
                      <span className="font-medium">{t('subscription.duration')}:</span> {selectedPlan.durationInDays} {t('subscription.days')}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">{t('subscription.noPlan')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantReviewStep;

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5">{icon}</span>}
      <div className="space-y-0.5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="text-sm font-medium leading-tight">{value}</div>
      </div>
    </div>
  );
}
