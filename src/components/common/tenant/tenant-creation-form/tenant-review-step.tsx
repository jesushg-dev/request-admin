'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building, Check, FileText, ImageIcon, LinkIcon, Mail, MapPin, Package, Palette, Phone, Tag, ViewIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { TenantCreationValues } from '.';
import { Plan } from './plan-selection-step';

interface TenantReviewStepProps {
  plans: Plan[];
}

const TenantReviewStep = ({ plans }: TenantReviewStepProps) => {
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
    <Card>
      <CardHeader>
        <CardTitle>Review Your Tenant Information</CardTitle>
        <CardDescription>Please review the information below before creating your tenant.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium mb-3">Basic Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organization Name</p>
                <p className="font-medium">{data.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <p className="font-medium">{data.slug}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="w-full">
                <p className="text-sm font-medium text-muted-foreground">Logo</p>
                <div className="mt-1 flex items-start gap-3">
                  {data.logo ? (
                    <div className="relative border rounded-md overflow-hidden h-16 w-16 bg-muted/30 flex items-center justify-center">
                      {!logoPreviewError ? (
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
                    {logoPreviewError && data.logo && <p className="text-xs text-destructive mt-1">Unable to load logo preview</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website URL</p>
                <p className="font-medium break-all">{data.websiteUrl ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Information */}
        <div>
          <h3 className="text-lg font-medium mb-3">Content Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2 md:col-span-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="font-medium">{data.title ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="font-medium">{data.description ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Branding */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium mb-3">Branding</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Primary Color</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: data.primaryColor }} />
                  <span className="font-medium">{data.primaryColor}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Secondary Color</p>
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
              <p className="text-sm font-medium text-muted-foreground">Preview</p>
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
                    Get Started
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
          <h3 className="text-lg font-medium mb-3">Contact Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-medium">{data.contactEmail ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="font-medium">{data.contactPhone ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="font-medium">{data.address ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Subscription Plan */}
        <div>
          <h3 className="text-lg font-medium mb-3">Selected Plan</h3>
          {selectedPlan ? (
            <div className="border rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h4 className="font-medium text-lg">{selectedPlan.name}</h4>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {selectedPlan.price === 0 ? 'Free' : `$${selectedPlan.price.toFixed(2)}`}
                  {selectedPlan.durationInDays && selectedPlan.price > 0 && ` / ${selectedPlan.durationInDays} days`}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>

              <div className="mt-3 grid gap-2">
                {selectedPlan.id === '1' && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Basic authentication features</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Up to 1,000 monthly active users</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Community support</span>
                    </div>
                  </>
                )}

                {selectedPlan.id === '2' && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>All Basic features</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Up to 10,000 monthly active users</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Priority email support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Advanced security features</span>
                    </div>
                  </>
                )}

                {selectedPlan.id === '3' && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>All Pro features</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Unlimited monthly active users</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>24/7 dedicated support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Custom integrations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>SLA guarantees</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No plan selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantReviewStep;
