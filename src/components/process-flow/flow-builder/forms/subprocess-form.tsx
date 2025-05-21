import { useTranslations } from 'next-intl';

import { SubProcessNodeData } from '@/types/execution-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { BaseForm } from './base-form';

interface SubProcessFormProps {
  formData: SubProcessNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function SubProcessForm({ formData, onGuideClick, onChange }: SubProcessFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="processRef">{t('processRef')}</Label>
        <Input id="processRef" value={formData.processRef || ''} onChange={(e) => onChange('processRef', e.target.value)} placeholder="Process ID or name" />
      </div>
    </BaseForm>
  );
}
