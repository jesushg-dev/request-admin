'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { ThemeColors } from '@/types/theme-colors';
import { oklchToColorPickerFormat } from '@/lib/color-utils';

interface ThemeColorsPreviewProps {
  colors: ThemeColors;
  mode: 'light' | 'dark';
}

export const ThemeColorsPreview: FC<ThemeColorsPreviewProps> = ({ colors, mode }) => {
  const getColor = (key: keyof ThemeColors): string => {
    const color = colors[key];
    if (!color || typeof color !== 'string') return '';
    // OKLCH format is already CSS-compatible, use directly
    if (color.startsWith('oklch(')) {
      return color;
    }
    // Try to convert if it's not already OKLCH
    const converted = oklchToColorPickerFormat(color);
    return converted || color;
  };

  const bgColor = getColor('background') || (mode === 'dark' ? '#252525' : '#ffffff');
  const fgColor = getColor('foreground') || (mode === 'dark' ? '#fafafa' : '#252525');
  const primaryColor = getColor('primary') || (mode === 'dark' ? '#e5e5e5' : '#343434');
  const primaryFgColor = getColor('primary-foreground') || (mode === 'dark' ? '#252525' : '#fafafa');
  const secondaryColor = getColor('secondary') || (mode === 'dark' ? '#404040' : '#f5f5f5');
  const cardColor = getColor('card') || (mode === 'dark' ? '#2a2a2a' : '#ffffff');
  const cardFgColor = getColor('card-foreground') || (mode === 'dark' ? '#fafafa' : '#252525');
  const borderColor = getColor('border') || (mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e5e5e5');
  const mutedColor = getColor('muted') || (mode === 'dark' ? '#404040' : '#f5f5f5');
  const destructiveColor = getColor('destructive') || '#ef4444';

  return (
    <div
      className="rounded-lg border p-6 space-y-6 transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        color: fgColor,
        borderColor: borderColor,
      }}
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: fgColor }}>
          Theme Preview
        </h3>

        {/* Buttons Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-70">Buttons</p>
          <div className="flex flex-wrap gap-2">
            <Button
              style={{
                backgroundColor: primaryColor,
                color: primaryFgColor,
              }}
            >
              Primary Button
            </Button>
            <Button variant="secondary" style={{ backgroundColor: secondaryColor }}>
              Secondary
            </Button>
            <Button variant="destructive" style={{ backgroundColor: destructiveColor }}>
              Destructive
            </Button>
            <Button variant="outline" style={{ borderColor: borderColor }}>
              Outline
            </Button>
          </div>
        </div>

        <Separator style={{ backgroundColor: borderColor }} />

        {/* Card Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-70">Card</p>
          <Card style={{ backgroundColor: cardColor, borderColor: borderColor }}>
            <CardHeader>
              <CardTitle style={{ color: cardFgColor }}>Card Title</CardTitle>
            </CardHeader>
            <CardContent style={{ color: cardFgColor }}>
              <p className="text-sm opacity-80">
                This is a preview of how cards will look with your theme colors.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator style={{ backgroundColor: borderColor }} />

        {/* Input Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-70">Inputs</p>
          <div className="space-y-2">
            <Input
              placeholder="Enter text here..."
              style={{
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                borderColor: borderColor,
                color: fgColor,
              }}
            />
            <Input
              placeholder="Disabled input"
              disabled
              style={{
                borderColor: borderColor,
              }}
            />
          </div>
        </div>

        <Separator style={{ backgroundColor: borderColor }} />

        {/* Badges Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-70">Badges</p>
          <div className="flex flex-wrap gap-2">
            <Badge style={{ backgroundColor: primaryColor, color: primaryFgColor }}>Default</Badge>
            <Badge variant="secondary" style={{ backgroundColor: secondaryColor }}>
              Secondary
            </Badge>
            <Badge variant="destructive" style={{ backgroundColor: destructiveColor }}>
              Destructive
            </Badge>
            <Badge variant="outline" style={{ borderColor: borderColor }}>
              Outline
            </Badge>
          </div>
        </div>

        <Separator style={{ backgroundColor: borderColor }} />

        {/* Alerts Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-70">Alerts</p>
          <div className="space-y-2">
            <Alert style={{ backgroundColor: mutedColor, borderColor: borderColor }}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>This is an informational alert.</AlertDescription>
            </Alert>
            <Alert variant="default" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
              <CheckCircle2 className="h-4 w-4" style={{ color: primaryFgColor }} />
              <AlertDescription style={{ color: primaryFgColor }}>Success message here.</AlertDescription>
            </Alert>
            <Alert variant="destructive" style={{ backgroundColor: destructiveColor }}>
              <XCircle className="h-4 w-4" />
              <AlertDescription>Error message here.</AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Text Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-70">Typography</p>
          <div className="space-y-1" style={{ color: fgColor }}>
            <h1 className="text-3xl font-bold">Heading 1</h1>
            <h2 className="text-2xl font-semibold">Heading 2</h2>
            <h3 className="text-xl font-medium">Heading 3</h3>
            <p className="text-base opacity-80">Regular paragraph text with some content to show how it looks.</p>
            <p className="text-sm opacity-60">Small text for captions and descriptions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

