import { useTranslations } from 'next-intl';

import { StepNodeData } from '@/types/execution-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { BaseForm } from './base-form';

interface StepFormProps {
  formData: StepNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function StepForm({ formData, onGuideClick, onChange }: StepFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="action">{t('action')}</Label>
        <Textarea id="action" value={formData.action || ''} onChange={(e) => onChange('action', e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="responsible">{t('responsible')}</Label>
        <Input id="responsible" value={formData.responsible || ''} onChange={(e) => onChange('responsible', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedTime">{t('estimatedTime')}</Label>
          <Input id="estimatedTime" type="number" value={formData.estimatedTime || 0} onChange={(e) => onChange('estimatedTime', Number(e.target.value))} min="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeUnit">{t('timeUnit')}</Label>
          <Select value={formData.timeUnit || 'minutes'} onValueChange={(value) => onChange('timeUnit', value)}>
            <SelectTrigger id="timeUnit">
              <SelectValue placeholder={t('timeUnit')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">{t('timeUnits.minutes')}</SelectItem>
              <SelectItem value="hours">{t('timeUnits.hours')}</SelectItem>
              <SelectItem value="days">{t('timeUnits.days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sla">{t('sla')}</Label>
        <Input id="sla" type="number" value={formData.sla || ''} onChange={(e) => onChange('sla', e.target.value)} min="0" />
      </div>
    </BaseForm>
  );
}
