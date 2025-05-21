import { useTranslations } from 'next-intl';

import { ConditionNodeData } from '@/types/execution-flow';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { BaseForm } from './base-form';

interface ConditionFormProps {
  formData: ConditionNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function ConditionForm({ formData, onGuideClick, onChange }: ConditionFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="expression">{t('expression')}</Label>
        <Textarea id="expression" value={formData.expression || ''} onChange={(e) => onChange('expression', e.target.value)} rows={3} placeholder="e.g., request.priority > 3" />
      </div>
    </BaseForm>
  );
}
