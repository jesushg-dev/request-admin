import { Link } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BaseNodeData } from '@/types/execution-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BaseFormProps {
  formData: BaseNodeData & { linkedGuides?: string[] };
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
  children?: React.ReactNode;
}

export function BaseForm({ formData, onGuideClick, onChange, children }: BaseFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">{t('label')}</Label>
        <Input id="label" value={formData.label || ''} onChange={(e) => onChange('label', e.target.value)} />
      </div>
      {children}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t('linkedGuides')}</Label>
          <Button type="button" variant="outline" size="sm" onClick={onGuideClick}>
            <Link className="w-4 h-4 mr-2" /> {t('linkGuides')}
          </Button>
        </div>
        <div className="border rounded p-2 min-h-[60px] bg-gray-50">
          {formData.linkedGuides && formData.linkedGuides.length > 0 ? (
            <ul className="space-y-1">
              {formData.linkedGuides.map((guideId: string) => (
                <li key={guideId} className="text-sm">
                  • {guideId}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">{t('noLinkedGuides')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
