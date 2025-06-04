'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building, FileText, ImageIcon, LinkIcon, Mail, MapPin, Package, Palette, Phone, Tag, ViewIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWatch } from 'react-hook-form';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium mb-3">{t('basicInfo.title')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('basicInfo.orgName')}</p>
                <p className="font-medium">{data.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('basicInfo.slug')}</p>
                <p className="font-medium">{data.slug}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="w-full">
                <p className="text-sm font-medium text-muted-foreground">{t('basicInfo.logo')}</p>
                <div className="mt-1 flex items-start gap-3">
                  {data.logo ? (
                    <div className="relative border rounded-md overflow-hidden h-16 w-16 bg-muted/30 flex items-center justify-center">
                      {!logoPreviewError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.logo ?? '/placeholder.svg'} alt={`${data.name} logo`} className="object-contain p-1" onError={() => setLogoPreviewError(true)} />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden h-16 w-16 bg-muted/30 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium break-all text-sm">{data.logo ?? '—'}</p>
                    {logoPreviewError && data.logo && <p className="text-xs text-destructive mt-1">{t('basicInfo.unableToLoadLogo')}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('basicInfo.websiteUrl')}</p>
                <p className="font-medium break-all">{data.websiteUrl ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Information */}
        <div>
          <h3 className="text-lg font-medium mb-3">{t('contentInfo.contentInfoTitle')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2 md:col-span-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('contentInfo.title')}</p>
                <p className="font-medium">{data.title ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('contentInfo.description')}</p>
                <p className="font-medium">{data.description ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Branding */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium mb-3">{t('branding.title')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('branding.primaryColor')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: data.primaryColor }} />
                  <span className="font-medium">{data.primaryColor}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('branding.secondaryColor')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: data.secondaryColor }} />
                  <span className="font-medium">{data.secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <ViewIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p className="text-sm font-medium text-muted-foreground">{t('branding.preview')}</p>
            </div>
            <div>
              <div className="border rounded-lg overflow-hidden shadow-lg">
                {/* Browser chrome */}
                <div className="bg-gray-100 border-b p-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="bg-white rounded-full text-xs py-1 px-3 text-gray-500 text-center overflow-hidden whitespace-nowrap overflow-ellipsis">
                      {data.websiteUrl ?? `${data.slug}.example.com`}
                    </div>
                  </div>
                  <div className="text-xs bg-black text-white px-1.5 py-0.5 rounded">1:1</div>
                </div>

                {/* Website header */}
                <div className="p-2 flex items-center justify-between" style={{ backgroundColor: data.primaryColor ?? '#0243ac' }}>
                  <div className="flex items-center gap-2">
                    {!logoPreviewError && data.logo ? (
                      <div className="relative h-8 w-8 bg-white rounded overflow-hidden">
                        <img src={data.logo ?? '/placeholder.svg'} alt={`${data.name} logo`} className="object-contain p-1" onError={() => setLogoPreviewError(true)} />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-white rounded flex items-center justify-center">
                        <span className="text-xs font-bold" style={{ color: data.primaryColor ?? '#0243ac' }}>
                          {(data.name ?? '').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-bold text-white">{data.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-4 h-4 bg-white/20 rounded"></div>
                    <div className="w-4 h-4 bg-white/20 rounded"></div>
                    <div className="w-4 h-4 bg-white/20 rounded"></div>
                  </div>
                </div>

                {/* Website content */}
                <div className="min-h-[300px] p-8 flex flex-col items-center justify-center text-center">
                  <h1 className="text-3xl font-bold mb-2">{data.title ?? data.name}</h1>
                  <p className="text-gray-600 mb-6 max-w-md">{data.description ?? 'Open Source Document Sharing Infrastructure'}</p>

                  <div className="px-4 py-2 rounded-md text-white font-medium" style={{ backgroundColor: data.secondaryColor ?? '#297dd6' }}>
                    {t('branding.getStarted')}
                  </div>

                  <div className="mt-12 grid grid-cols-4 gap-8">
                    <div className="h-8 bg-gray-100 rounded"></div>
                    <div className="h-8 bg-gray-100 rounded"></div>
                    <div className="h-8 bg-gray-100 rounded"></div>
                    <div className="h-8 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium mb-3">{t('contactInfo.title')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('contactInfo.email')}</p>
                <p className="font-medium">{data.contactEmail ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('contactInfo.phone')}</p>
                <p className="font-medium">{data.contactPhone ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('contactInfo.address')}</p>
                <p className="font-medium">{data.address ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Subscription Plan */}
        <div>
          <h3 className="text-lg font-medium mb-3">{t('subscription.title')}</h3>
          {selectedPlan ? (
            <div className="flex items-start gap-2">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-muted-foreground">{selectedPlan.name}</p>
                  {selectedPlan.popular && <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">{t('subscription.popular')}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{t('subscription.price')}:</span> {selectedPlan.price === 0 ? t('subscription.free') : `$${selectedPlan.price}`}
                  </p>
                  {selectedPlan.durationInDays && (
                    <p className="text-sm">
                      <span className="font-medium">{t('subscription.duration')}:</span> {selectedPlan.durationInDays} {t('subscription.days')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('subscription.noPlan')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantReviewStep;
