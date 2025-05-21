import { useTranslations } from 'next-intl';

import { LoopNodeData } from '@/types/execution-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { BaseForm } from './base-form';

interface LoopFormProps {
  formData: LoopNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function LoopForm({ formData, onGuideClick, onChange }: LoopFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="condition">{t('condition')}</Label>
        <Textarea id="condition" value={formData.condition || ''} onChange={(e) => onChange('condition', e.target.value)} rows={3} placeholder="e.g., index < items.length" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxIterations">{t('maxIterations')}</Label>
        <Input id="maxIterations" type="number" value={formData.maxIterations || 10} onChange={(e) => onChange('maxIterations', Number(e.target.value))} min="1" />
      </div>
    </BaseForm>
  );
}
