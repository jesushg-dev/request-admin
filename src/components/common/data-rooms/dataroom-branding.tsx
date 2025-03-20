'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DataroomBrandingProps {
  dataroomId: string;
}

interface BrandingSettings {
  logo: string | null;
  banner: string | null;
  brandColor: string;
  accentColor: string;
}

export function DataroomBranding({ dataroomId }: DataroomBrandingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [branding, setBranding] = useState<BrandingSettings>({
    logo: null,
    banner: null,
    brandColor: '#4f46e5',
    accentColor: '#818cf8',
  });

  useEffect(() => {
    // Simulate API call to fetch branding settings
    const fetchBranding = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock data
        setBranding({
          logo: null,
          banner: null,
          brandColor: '#4f46e5',
          accentColor: '#818cf8',
        });
      } catch (error) {
        toast.error('Failed to fetch branding settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranding();
  }, [dataroomId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real application, you would upload the file to your storage service
      // For now, we'll just create a local URL
      const file = e.target.files[0];
      const logoUrl = URL.createObjectURL(file);
      setBranding({ ...branding, logo: logoUrl });
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real application, you would upload the file to your storage service
      // For now, we'll just create a local URL
      const file = e.target.files[0];
      const bannerUrl = URL.createObjectURL(file);
      setBranding({ ...branding, banner: bannerUrl });
    }
  };

  const handleColorChange = (field: 'brandColor' | 'accentColor', value: string) => {
    setBranding({ ...branding, [field]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real application, you would call your API to save the branding settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Branding settings saved successfully');
    } catch (error) {
      toast.error('Failed to save branding settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dataroom Branding</CardTitle>
          <CardDescription>Customize the appearance of your dataroom</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Logo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {branding.logo ? (
                  <div className="flex flex-col items-center">
                    <img src={branding.logo || '/placeholder.svg'} alt="Logo" className="max-h-24 mb-4" />
                    <Button variant="outline" size="sm" onClick={() => setBranding({ ...branding, logo: null })}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input type="file" id="logo-upload" className="hidden" onChange={handleLogoChange} accept="image/*" />
                    <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="text-sm font-medium">Click to upload logo</span>
                      <span className="text-xs text-gray-500">PNG, JPG, SVG (max 2MB)</span>
                    </label>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Recommended size: 200x50 pixels</p>
            </div>

            <div className="space-y-4">
              <Label>Banner</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {branding.banner ? (
                  <div className="flex flex-col items-center">
                    <img src={branding.banner || '/placeholder.svg'} alt="Banner" className="max-h-24 mb-4" />
                    <Button variant="outline" size="sm" onClick={() => setBranding({ ...branding, banner: null })}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input type="file" id="banner-upload" className="hidden" onChange={handleBannerChange} accept="image/*" />
                    <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="text-sm font-medium">Click to upload banner</span>
                      <span className="text-xs text-gray-500">PNG, JPG, SVG (max 2MB)</span>
                    </label>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Recommended size: 1200x300 pixels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brand-color">Brand Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: branding.brandColor }} />
                <Input id="brand-color" type="text" value={branding.brandColor} onChange={(e) => handleColorChange('brandColor', e.target.value)} />
                <Input type="color" value={branding.brandColor} onChange={(e) => handleColorChange('brandColor', e.target.value)} className="w-12 p-1 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: branding.accentColor }} />
                <Input id="accent-color" type="text" value={branding.accentColor} onChange={(e) => handleColorChange('accentColor', e.target.value)} />
                <Input type="color" value={branding.accentColor} onChange={(e) => handleColorChange('accentColor', e.target.value)} className="w-12 p-1 h-10" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Branding Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your dataroom will look with the current branding settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border rounded-lg overflow-hidden"
            style={
              {
                '--brand-color': branding.brandColor,
                '--accent-color': branding.accentColor,
              } as React.CSSProperties
            }>
            <div
              className="h-32 bg-cover bg-center flex items-center justify-center"
              style={{
                backgroundColor: branding.brandColor,
                backgroundImage: branding.banner ? `url(${branding.banner})` : 'none',
              }}>
              {branding.logo ? <img src={branding.logo || '/placeholder.svg'} alt="Logo" className="max-h-16" /> : <div className="text-white text-2xl font-bold">Dataroom Logo</div>}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: branding.accentColor }} />
                <div className="font-medium">Navigation Item</div>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-full rounded-md bg-gray-100 dark:bg-gray-800"></div>
                <div className="h-8 w-3/4 rounded-md bg-gray-100 dark:bg-gray-800"></div>
                <div className="h-8 w-1/2 rounded-md bg-gray-100 dark:bg-gray-800"></div>
              </div>

              <div className="mt-4">
                <Button className="w-full" style={{ backgroundColor: branding.brandColor, color: 'white' }}>
                  Sample Button
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
